import { PLANS } from '@/lib/constant';
import { Check } from 'lucide-react';
import React from 'react'
import PlanCard from './PlanCard';

const PricingContent = () => {
  return (
    <div>
      <div className="w-full pl-3 mt-16 mb-1">
        <h2 className="text-lg lg:text-xl font-medium">All plans</h2>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-3 border-b">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="grid grid-cols-3 bg-gray-50/80 dark:bg-secondary/40 min-h-56 pb-5">
          {PLANS.map((plan) => {
            return (
              <div key={plan.name} className="p-6 space-y-3">
                {plan.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PricingContent