import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Logo from "@/components/layout/Logo"
import HoverBorderGradient from "@/components/global/HoverBorderGradient"

function Navbar() {
  return (
    <header>
      <nav
        className={cn(
          "mx-auto mt-px flex items-center justify-between gap-3",
          "rounded-full border bg-white/70 px-4 py-2 shadow-sm backdrop-blur-md",
          "dark:bg-black/30"
        )}
        aria-label="Primary">
        <Logo url="/" />
        <ul className="hidden items-center gap-6 text-sm font-normal md:flex xl:text-base">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Features
            </Link>
          </li>
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Blog
            </Link>
          </li>
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Contact us
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/auth/sign-in" className="hover:text-foreground hidden text-sm transition-colors md:inline">
            Sign In
          </Link>
          <Link href="/auth/sign-up" aria-label="Try WaveAI for free">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2">
              <span>Try toto.ai for Free</span>
              <ArrowRight className="h-4 w-4" />
            </HoverBorderGradient>
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
