"use client"
import { useTheme } from "next-themes"
import React from "react"
import Image from "next/image"

const AppPreview = () => {
  const { theme } = useTheme()
  const isDark = theme === "dark" ? true : false
  return (
    <section className="-mt-10">
      <div className="dark:bg-background relative mx-auto max-w-5xl overflow-hidden rounded-3xl border bg-white shadow-md">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="w-full">
            <div className="bg-background relative mx-auto overflow-hidden rounded-(--radius) border border-transparent shadow-xl ring-1 shadow-black/10 ring-black/10">
              <Image src='/image.png' alt="app screen" width="2880" height="1842" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppPreview
