import { LoaderIcon } from "lucide-react"
import React, { useEffect, useState } from "react"

type Props = {
  loadingText: string
}

const ToolLoadingIndicator = React.memo(({ loadingText }: Props) => {
  const [time, setTime] = useState(0)

  // 每秒钟更新一次
  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-background/50 relative w-full rounded-md p-4 shadow-sm">
      <div className="text-primary absolute top-2 right-2 text-xs">{time}s</div>
      <div className="mb-2 flex items-center gap-2">
        <LoaderIcon className="h-4 w-4 animate-spin" />
        <span className="text-sm font-light">{loadingText}</span>
      </div>
      <div className="bg-background/30 h-1 w-full overflow-hidden rounded-full">
        <div className="bg-primary animate-progressBar h-full rounded-full"></div>
      </div>
    </div>
  )
})

ToolLoadingIndicator.displayName = "ToolLoadingIndicator"

export default ToolLoadingIndicator
