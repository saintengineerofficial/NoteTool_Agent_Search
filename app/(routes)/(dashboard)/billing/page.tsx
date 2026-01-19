import React from "react";
import ChatHeader from "../_components/ChatHeader";
import PricingContent from "./_components/PricingContent";

const Page = () => {
  return (
    <React.Fragment>
      <ChatHeader title="Billings" />
      <div className="w-full max-w-6xl mx-auto">
        <div className="w-full">
          <PricingContent />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Page;
