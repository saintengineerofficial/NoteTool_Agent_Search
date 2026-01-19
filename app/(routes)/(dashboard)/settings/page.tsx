"use client";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChatHeader from "../_components/ChatHeader";
import React from "react";

const Page = () => {
  const { theme, setTheme } = useTheme();

  return (
    <React.Fragment>
      <ChatHeader title="Settings" />
      <div className="w-full max-w-6xl mx-auto">
        <div className="w-full space-y-6 pt-20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Appearance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose your preferred theme</p>
            </div>

            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Page;
