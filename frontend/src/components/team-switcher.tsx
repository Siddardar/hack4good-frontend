"use client"

import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  company,
}: {
  company: {
    name: string
    logo: React.ElementType
    subtitle: string
  }
}) {
  return (
    <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton size="lg" asChild>
        <a href="#">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <company.logo className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">{company.name}</span>
            <span className="">{company.subtitle}</span>
          </div>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
  )
}
