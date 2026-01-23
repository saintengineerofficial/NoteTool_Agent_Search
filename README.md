工具时序冲突 → 设计工具调用状态机（idle → planning → tool_call → tool_result → decide），并在服务端统一编排而不是靠 prompt工具错误处理 → 做 error
taxonomy（网络/权限/限流/无结果/格式错误）+ 策略矩阵（重试/降级/换工具/询问用户）任务拆解 → 引入拆解阈值（长度/复杂度/成本），超阈值进入“分解模式”，并记录子任务与依赖记忆碎片化 →
short-term summary + long-term vector
memory + 关键实体槽位（强保留），明确阈值和清理策略多任务并发 → 引入工具队列与锁（按资源分类：搜索/写入/外部API），避免同时写入冲突模糊需求 → 先做意图补全：用户画像 + 上下文猜测 + 低成本澄清问题，而不是直接“请补充”

1. 工具时序冲突与编排

目标：避免“工具互相抢、结果覆盖、链式失控”方案：在服务端引入轻量“对话编排状态机”状态：idle → plan → tool_call → tool_result → decide →
respond约束：同一轮只允许一个工具执行；多工具必须显式确认记录：last_tool, last_result,
requires_confirm可落地点：chat.ts（请求进来时检查状态、决定允许/拒绝工具）2) 工具错误处理（不是只重试）

目标：不同错误采取不同策略方案：定义错误分类与策略矩阵分类：rate_limit / auth / network / empty_result / invalid_format /
timeout 策略：重试（指数退避）/ 降级（换工具）/ 问用户 / 直接返回失败并解释可落地点：lib/ai/tools/\* 中统一包装返回结构 + 在 chat
route 统一判断 3) 任务拆解阈值与层级

目标：不是“能跑就行”，而是对复杂任务分解方案：定义拆解触发条件条件：用户输入长度、包含多目标关键词、需要多工具协作输出：task_plan（步骤、工具、输入、依赖）可落地点：系统提示中加入“先给简短计划”，并在服务端保留 plan 到会话元数据4) 记忆策略（短期/长期/关键信息）

目标：避免“定期清理”这种粗放处理方案：三层记忆Short-term：最近 N 轮原文Summary：每 M 轮生成摘要（结构化：目标/已完成/待办）Long-term：向量库写入“关键信息”（用户偏好、固定事实）可落地点：message 表 + 新增 summary 字段/表；检索拼接在 convertToModelMessages 前5) 并发与多工具抢占

目标：避免“多线程”式无脑并发方案：工具队列 + 资源锁资源分类：write_note, search, web 规则：同一资源串行，不同资源可并发可落地点：chat
route 中建立 per-chat in-memory queue（MVP），或持久队列 6) 模糊需求的主动补全

目标：体验不是“请补充”，而是“先猜再问”方案：先给合理默认，再提出 1–2 个精确问题例：用户说“帮我做个研究”，先推断主题/输出格式，再问关键缺口可落地点：系统提示 + 前端提示模板7) 工具选择的强制性

目标：用户选了工具就必须执行那一个方案：当 selectedToolName 存在时，toolChoice 强制锁定可落地点：chat route（逻辑层）

A) 技术设计文档（细化版）

1. 背景与目标

当前问题：工具调用时序不稳定、错误处理粗糙、任务拆解/记忆/并发缺失、工具选择不受控。目标：把 Agent 从“组件拼接”提升到“可控决策系统”，提升稳定性、可解释性、可扩展性。2. 设计原则

单轮只允许 1 个工具执行（除非用户明确确认链式调用）工具调用强制可控（用户选工具 > 自动选择）错误分类+策略矩阵，而不是“统一重试”记忆分层：短期/摘要/长期并发用队列与资源锁，不用裸并发模糊需求先推断后澄清，减少“请补充” 3. 核心流程

状态机：idle → plan → tool_call → tool_result → decide → respond
plan：判断是否需要拆解/工具tool_call：检查 tool 选择权限、并发限制、是否需要确认tool_result：解析返回、错误分类、决定策略decide：继续/总结/询问工具链控制：若 selectedToolName 存在：强制执行该工具一次多工具链：必须 requires_confirm
= true，等待用户确认关键字4. 错误处理策略矩阵

rate_limit → 退避重试（最多 2 次）→ 提示用户稍后再试 auth → 直接失败，提示配置缺失 network/timeout
→ 退避重试 → 若仍失败，降级（比如不调用 webSearch）empty_result → 提示结果为空 + 建议修改关键词 invalid_format → 修正或重新请求 5. 任务拆解机制

触发条件：输入长度 > N（如 300 字）同时包含多个目标动词（如“比较、总结、写成、保存”）需要 >1 工具输出：task_plan（步骤、工具、依赖、目标）6. 记忆策略

Short-term：最近 20 条消息原文Summary：每 10 条生成结构化摘要（目标/已完成/待办）Long-term：重要事实/偏好/实体写入向量库检索：优先摘要，再拼短期7. 并发调度

工具资源锁：write_note, search, web 同一资源串行；不同资源可并发默认工具队列 per chat B) 具体改造清单（按文件、步骤、数据结构）

1. 新增/扩展数据结构

Chat 或 Session 增加字段：state（enum: idle, plan, tool_call, tool_result,
decide）requiresConfirm（bool）lastTool（string|null）lastResultSummary（string|null）新表或扩展：ChatSummary：chatId, summary, createdAt
ToolCallLog：chatId, toolName, status, errorType, createdAt 2) 服务端核心逻辑

chat.ts 读取 selectedToolName，有则 toolChoice 强制状态机判断：若 requiresConfirm 且用户未确认 → 拒绝继续调用下一工具加入错误分类与策略分支（根据 tool 返回结构）增加 maxSteps 或提升 stopWhen 加入工具队列/锁（最小可用为 in-memory
map）3) 工具封装

lib/ai/tools/\* 返回统一结构：{ code, message, data, errorType?
} 所有工具返回 errorType，便于策略处理 webSearch/extractWebUrl 需要 timeout/empty_result 分类 4) Prompt 系统

prompt.ts明确“工具确认的触发条件与确认关键字”明确“用户选工具必须强制执行该工具”加入“模糊需求补全”规则（先猜、后问）5) 前端交互

ChatInput.tsx当用户选工具时，UI提示“已锁定工具：xxx”如果需要确认链式调用，提示用户“回复确认关键字即可继续”
ChatMessages.tsx对系统状态展示（比如“等待确认”）6) 记忆策略实现

actions.ts 或新增 memory.ts 摘要生成：每 N 条更新摘要对话组装：summary + recent_messages schema.prisma 增加 ChatSummary 表或在 Chat 增加 summary 字段
