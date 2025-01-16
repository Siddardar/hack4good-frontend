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
        <>
    <label className="block text-sm font-medium text-black">Select a previously generated report</label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date Range</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dateRanges.map((item, index) => (
            <TableRow 
              key={index}
              onClick={() =>
                handleRowClick(item.dateRange.from, item.dateRange.to)
              }>
              <TableCell className="font-medium">
                    {format(item.dateRange.from, "LLL dd, y")} -{" "}
                    {format(item.dateRange.to, "LLL dd, y")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </>
    )
  }
  