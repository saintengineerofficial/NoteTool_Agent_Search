import React from 'react'

type Props = {}

const Greeting = (props: Props) => {
  return (
    <div className="w-full h-full md:mt-3 px-2 flex flex-col">
      <div className="text-2xl font-semibold opacity-0 fade-in-up [animation-delay:200ms]">
        Hello there!
      </div>
      <div className="text-2xl  text-zinc-500 opacity-0 fade-in-up [animation-delay:400ms]">
        How can I help you today?
      </div>
    </div>
  )
}

export default Greeting