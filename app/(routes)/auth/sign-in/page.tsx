import React from "react";
import Logo from "@/components/layout/Logo";
import SignInForm from "../_components/SignInForm";

const Page = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-[6px] p-[6px] md:p-[10px]">
      <div className="relative flex w-full max-w-sm flex-col gap-[6px]">
        <div className="w-full flex items-center justify-center">
          <Logo />
        </div>
        <SignInForm />
      </div>
    </div>
  );
};

export default Page;
