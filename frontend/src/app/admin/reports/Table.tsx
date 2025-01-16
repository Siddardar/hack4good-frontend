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

type DatesTableProps = {
  dateRanges: { id: string; from: Date; to: Date; accessed_at?: Date }[]
}

export function DatesTable({ dateRanges }: DatesTableProps) {
  const router = useRouter()

  const handleRowClick = (id: string, from: Date, to: Date) => {
    const fromString = new Date(from).toISOString()
    const toString = new Date(to).toISOString()

    try {
      const response = fetch(`http://localhost:8080/date-ranges/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessed_at: new Date().toISOString(),
        }),
      })

      router.push(`/admin/reports/report?from=${fromString}&to=${toString}`)
    } catch (error) {
      console.error("Error updating date range:", error)
    }
  }

  return (
    <div className="w-2/3 flex flex-col">
      <label className="block text-sm font-medium text-black mb-2">
        Select a previously generated report
      </label>
      <ScrollArea className="max-h-72 h-auto overflow-y-auto rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Date Range</h4>
          {dateRanges.map((item, index) => (
            <div key={index}>
              <div
                className="text-sm cursor-pointer hover:text-blue-600"
                onClick={() =>
                  handleRowClick(item.id, item.from, item.to)
                }
              >
                {format(item.from, "LLL dd, y")} -{" "}
                {format(item.to, "LLL dd, y")}
              </div>
              {index < dateRanges.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
