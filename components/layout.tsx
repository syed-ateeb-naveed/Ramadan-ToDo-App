"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 flex flex-col perspective-1000">
      <main className="flex-1 p-4 relative transform-style-3d">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl z-0 transform translate-z-[-50px]"></div>
        <div className="relative z-10 transform translate-z-[50px]">{children}</div>
      </main>
      <nav className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 flex justify-around items-center border-t transform-style-3d">
        <NavLink href="/" icon={Home} label="Home" isActive={pathname === "/"} />
        <NavLink href="/tasks" icon={CheckSquare} label="Tasks" isActive={pathname === "/tasks"} />
        <NavLink href="/calendar" icon={Calendar} label="Calendar" isActive={pathname === "/calendar"} />
      </nav>
    </div>
  )
}

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
}: { href: string; icon: React.ElementType; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 transition-transform duration-300 ease-in-out transform hover:translate-y-[-5px] hover:translate-z-[10px]",
        isActive ? "text-purple-600" : "text-gray-500",
      )}
    >
      <Icon size={20} />
      <span className="text-xs">{label}</span>
    </Link>
  )
}

