"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { DatePickerForm } from "./DatePickerForm"
import { DatesTable } from "./Table"

export default function Page() {
  const [dateRanges, setDateRanges] = useState([])

  useEffect(() => {
    const fetchDateRanges = async () => {
      try {
        const response = await fetch("http://localhost:8080/date-ranges")
        const data = await response.json()
        setDateRanges(data)
      } catch (error) {
        console.error("Failed to fetch date ranges:", error)
      }
    }

    fetchDateRanges()
  }, [])

  const isDateRangesEmpty = dateRanges.length === 0

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className={`flex flex-1 items-center p-4 pt-0 ${isDateRangesEmpty ? "justify-center" : "justify-between"}`}>
          {!isDateRangesEmpty && (
            <div className="w-1/2 flex justify-center">
              <DatesTable dateRanges={dateRanges} />
            </div>
          )}
          <div className={`${isDateRangesEmpty ? "w-full flex justify-center" : "w-1/2 flex"}`}>
            <DatePickerForm />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
