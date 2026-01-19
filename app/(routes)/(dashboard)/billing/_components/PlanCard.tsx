import { Button } from '@/components/ui/button';
import { type PLANS } from '@/lib/constant';
import { Badge } from 'lucide-react';
import React from 'react'

type Props = {
  plan: (typeof PLANS)[number];

}

const PlanCard = ({ plan }: Props) => {
  return (
    <div className="flex flex-col p-6 border-l">
      <div className="flex-1">
        <div className="flex items-center justify-start gap-2 mb-2">
          <h3 className="capitalize text-lg lg:text-xl font-semibold">
            {plan?.name?.toLowerCase()}
          </h3>

          <Badge className="bg-primary/10 text-primary text-xs">
            Popular
          </Badge>
        </div>

        <div className="mb-4">
          <div className="text-base font-normal">
            ${plan.price}
            <span className="text-sm text-muted-foreground ml-1">
              per month billed
            </span>
          </div>
        </div>

      </div>

      <Button variant="outline">Manage</Button>
    </div>
  )
}

export default PlanCard