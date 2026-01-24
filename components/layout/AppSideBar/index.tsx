"use client"
import { RiScanLine, RiChatAiLine, RiBankCard2Line, RiSettings3Line } from "@remixicon/react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar"
import Logo from "../Logo"
import NavMenu from "./NavMenu"
import { useAuthToken } from "@/store/useAuthToken"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import NavUser from "./NavUser"
import NavNotes from "./NavNotes"
import NavChats from "./NavChats"

const items = [
  { title: "Home", url: "/home", icon: RiScanLine },
  { title: "AI Chat", url: "/chat", icon: RiChatAiLine },
  { title: "Billing", url: "/billing", icon: RiBankCard2Line },
  { title: "Settings", url: "/settings", icon: RiSettings3Line },
]

const AppSideBar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const router = useRouter()

  const { clearBearerToken } = useAuthToken()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // 获取session
  const { useSession, signOut } = authClient
  const { data: session, isPending } = useSession()
  const user = session?.user

  const handleLogout = () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    signOut({
      fetchOptions: {
        onSuccess: () => {
          clearBearerToken()
          router.push("/auth/sign-in")
          setIsSigningOut(false)
        },
        onError: ctx => {
          setIsSigningOut(false)
          toast.error(ctx.error.message)
        },
      },
    })
  }

  return (
    <Sidebar {...props} className="z-99">
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <Logo url="/home" />
          <SidebarTrigger className="-ms-4" />
        </div>
        <hr className="border-border mx-2 -mt-px" />
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden px-2 pt-2">
        <NavMenu items={items} />
        <NavChats />
        <NavNotes />
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-border mx-2 -mt-px" />
        <NavUser
          isLoading={isPending}
          user={{
            name: user?.name || "",
            email: user?.email || "",
          }}
          isSigningOut={isSigningOut}
          onSignOut={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSideBar
