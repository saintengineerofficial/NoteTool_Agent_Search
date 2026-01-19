"use client";
import React from "react";
import ChatHistory from "./ChatHistory";

type Props = {
  children: React.ReactNode;
};

const DashBoardContent = ({ children }: Props) => {
  return (
    <React.Fragment>
      <main className="relative w-full h-auto overflow-hidden">{children}</main>
      <ChatHistory />
    </React.Fragment>
  );
};

export default DashBoardContent;
