"use client"

import * as React from "react"
import { usePathname } from "next/navigation";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  Gavel,
  ShoppingBasket,
  Lock,
  Sun,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "https://github.com/shadcn.png",
  },
  company: {
    name: "Muhammadiyah",
    logo: Sun,
    subtitle: "Welfare Home",
  },
  navMain: [
    {
      title: "Store",
      url: "/store",
      icon: ShoppingBasket,
      isActive: true,
      items: [
        {
          title: "Favorites",
          url: "/store",
        },
        {
          title: "Recently Added",
          url: "/store",
        },
      ],
    },
    {
      title: "Auction",
      url: "/auction",
      icon: Gavel,
      items: [
        {
          title: "Favourites",
          url: "#",
        },
        {
          title: "Recently Added",
          url: "#",
        },
      ],
    },
    {
      title: "Admin",
      url: "/admin",
      icon: Lock,
      items: [
        {
          title: "Residents",
          url: "/admin/residents",
        },
        {
          title: "Staff",
          url: "#",
        },
        {
          title: "Voucher Tasks",
          url: "/admin/tasks",
        },
        {
          title: "Requests",
          url: "/admin/requests",
        },
        {
          title: "Reports",
          url: "/admin/reports",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const basePath = pathname.split('/').slice(0, 2).join('/');

  const updatedNavMain = data.navMain.map((navItem) => ({
    ...navItem,
    isActive: basePath === navItem.url,
    items: navItem.items?.map((subItem) => ({
      ...subItem,
      isActive: pathname === subItem.url,
    })),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher company={data.company}/>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={updatedNavMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
