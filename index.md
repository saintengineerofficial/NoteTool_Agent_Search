**目前可见不足**

- 状态机只在内存 Map 中维护，无法多实例部署，重启会丢状态。见 `lib/stat.ts`。
- 工具链只允许一次调用，复杂任务体验受限，且需要用户手动确认，交互略生硬。见 `app/api/[[...route]]/chat.ts`。
- 没有系统级上下文裁剪/摘要，历史消息越长越慢且成本上升。见 `app/api/[[...route]]/chat.ts` 使用全量消息。
- 错误处理只在工具层做分类提示，缺少全链路 retry/降级策略与可观测性（监控指标、错误追踪）。
- 外部搜索与抽取的结果无缓存，重复请求成本高。见 `lib/ai/tools/webSearch.ts`、`lib/ai/tools/extractWebUrl.ts`。
- 无向量检索/语义检索，`searchNote` 只是 `contains` 文本匹配，召回效果有限。见 `lib/ai/tools/searchNote.ts`。
- 没有 token/成本控制策略，`stepCountIs(3)` 只限制步数，不限制上下文长度或模型成本。
- prompt injection / 外部网页内容的安全过滤较弱，仅靠系统提示限制。见 `lib/ai/prompt.ts`。
- 聊天与笔记缺乏结构化引用关系（比如“这条回答保存为笔记”与来源绑定）。
- 测试覆盖缺失：工具、状态机、chat route、UI 流式渲染都缺乏自动化测试。

**可优化方向**

- 状态机持久化：把 `lib/stat.ts` 的状态移到 Redis / DB，支持多实例与恢复。
- 上下文裁剪/摘要：增加“短期消息 + 摘要 + 长期记忆”的拼接策略，降低 token 与 DB 负担。入口在 `app/api/[[...route]]/chat.ts`。
- 工具链策略升级：引入“计划-执行”两阶段，允许多工具但需显式确认或限制次数。
- 缓存层：对 `webSearch`/`extractWebUrl` 增加 Redis 缓存与 TTL，减少重复调用成本。
- 语义检索：接入向量库，扩展 `searchNote` 为 hybrid search（BM25 + embedding）。
- 统一错误处理：工具层输出标准结构后，chat route 做统一的 error policy（重试/降级/询问）。
- 成本/配额控制：按用户/套餐控制 token、工具调用次数、并在 UI 提示剩余额度。
- 文档/URL 生成“可追溯引用”：回答里附带来源与可信度评分。
- 自动笔记总结：每轮或每 N 轮自动生成 summary，支持“一键保存”。
- 多模型路由：不同任务分配不同模型（摘要用小模型、推理用大模型）。
- 工具执行队列与锁：避免并发工具写入冲突，提升一致性。
- 会话回放与版本：支持查看某次回答的“工具调用轨迹”和“模型版本”。
- 权限与数据隔离升级：引入 workspace/团队维度（多租户）。
- 监控与评估：引入日志与评估指标（工具成功率、响应时间、用户反馈）。

**具体**

- Message.parts 结构化落库 / schema 演进
- 消息裁剪 / 摘要
- Chat.userId 索引 / Message.userId 直连
- FTS / 向量检索
- Provider 能力检测 / 降级
- 工具输出过大限流（extractWebUrl）
- resumeStream 真正续流
- 多实例状态一致性（Redis 锁/持久化细化）
