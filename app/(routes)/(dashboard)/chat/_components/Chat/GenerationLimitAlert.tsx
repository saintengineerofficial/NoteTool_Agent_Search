import Link from "next/link"
import React from "react"

const GenerationLimitAlert = () => {
  return (
    <div className="absolute -top-6 mt-[0.3] w-full">
      <div className="bg-primary/10 flex w-full items-center justify-between overflow-hidden rounded-t-3xl px-4 pt-1.5 pb-4 text-xs font-medium">
        <div className="wrap-break-word">
          You’ve run out of free AI responses.{" "}
          <Link href="/billing" className="text-primary font-semibold hover:underline">
            Upgrade Wave AI.
          </Link>
        </div>
      </div>
    </div>
  )
}

export default GenerationLimitAlert
