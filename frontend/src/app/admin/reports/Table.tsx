"use client"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

  import { format } from "date-fns"
  import { useRouter } from "next/navigation"
  import { ScrollArea } from "@/components/ui/scroll-area"
  import { Separator } from "@/components/ui/separator"
  
  const dateRanges = [
    {
      dateRange: { from: new Date("2025-01-01"), to: new Date("2025-01-07") },
    },
    {
      dateRange: { from: new Date("2025-01-08"), to: new Date("2025-01-14") },
    },
    {
      dateRange: { from: new Date("2025-01-15"), to: new Date("2025-01-21") },
    },
    {
      dateRange: { from: new Date("2025-01-22"), to: new Date("2025-01-28") },
    },
    {
      dateRange: { from: new Date("2025-01-29"), to: new Date("2025-02-04") },
    },
    {
      dateRange: { from: new Date("2025-02-05"), to: new Date("2025-02-11") },
    },
    {
      dateRange: { from: new Date("2025-02-12"), to: new Date("2025-02-18") },
    },
  ]
  
  export function DatesTable() {
    const router = useRouter()

    const handleRowClick = (from: Date, to: Date) => {
      const fromString = from.toISOString()
      const toString = to.toISOString()
      router.push(`/admin/reports/report?from=${fromString}&to=${toString}`)
    }
    return (
      <div className="w-2/3 flex flex-col">
        <label className="block text-sm font-medium text-black mb-2">
          Select a previously generated report
        </label>
        <ScrollArea className="h-72 rounded-md border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Date Range</h4>
            {dateRanges.map((item, index) => (
              <div key={index}>
                <div
                  className="text-sm cursor-pointer hover:text-blue-600"
                  onClick={() =>
                    handleRowClick(item.dateRange.from, item.dateRange.to)
                  }
                >
                  {format(item.dateRange.from, "LLL dd, y")} -{" "}
                  {format(item.dateRange.to, "LLL dd, y")}
                </div>
                {index < dateRanges.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }
  