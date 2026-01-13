import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

type Props = {}

const LoadingMessages = (props: Props) => {
  return (
    <div className="w-full max-w-full mx-auto mt-5">
      <div className="flex items-start space-x-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="w-full flex flex-col space-y-2">
          <Skeleton className="h-8 w-8/12 rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default LoadingMessages