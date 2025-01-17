"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableHeader,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"

import { useIsMobile } from "@/hooks/use-mobile"
import { pages } from "next/dist/build/templates/app-page"

// --- Types ---
export type RequestInfo = {
  requestID: number
  dateRequested: string
  description: string
  status: "Pending" | "Approved" | "Rejected" | "Shipping" | "Completed"
  cost: number
  name: string
}


export function DataTable() {
  const [tableData, setTableData] = React.useState<RequestInfo[]>([])


  const updateReqStatus = React.useCallback(
    (requestID: number, newStatus: RequestInfo["status"]) => {
      setTableData((prevData) =>
        prevData.map((req) =>
          req.requestID === requestID ? { ...req, status: newStatus } : req
        )
      )
    },
    []
  )

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/my-requests", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setTableData(data);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      }
    };
    fetchData();
  }, []);

  const columns = React.useMemo<ColumnDef<RequestInfo>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "status",
        header: () => <div>Status</div>,
        cell: ({ row }) => <div>{row.getValue("status")}</div>,
        filterFn: (row, col, value) => {
          if (!value || value.length === 0) {
            return true
          }

          return value.includes(row.getValue(col))
        }
      },
      {
        accessorKey: "description",
        header: () => <div>Description</div>,
        cell: ({ row }) => <div>{row.getValue("description")}</div>,
      },
      {
        accessorKey: "cost",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              className="p-0 m-0 h-auto w-auto"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span className="flex items-center gap-1">
                Cost
                <ArrowUpDown />
              </span>
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("cost"))
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)
          return <div className="text-right font-medium mr-2.5">{formatted}</div>
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const req = row.original

          return (
            <DropdownMenu>
              {req.status !== "Completed" && (
                <>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Show the appropriate dropdown items based on req.status */}
                    {req.status === "Pending" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => updateReqStatus(req.requestID, "Approved")}
                        >
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateReqStatus(req.requestID, "Rejected")}
                        >
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {req.status === "Approved" && (
                      <>
                        <DropdownMenuItem onClick={() => updateReqStatus(req.requestID, "Shipping")}>
                          Ordered Item
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateReqStatus(req.requestID, "Rejected")}
                        >
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {req.status === "Rejected" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => updateReqStatus(req.requestID, "Approved")}
                        >
                          Approve
                        </DropdownMenuItem>
                      </>
                    )}
                    {req.status === "Shipping" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => updateReqStatus(req.requestID, "Completed")}
                        >
                          Mark as Completed
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </>
              )}
            </DropdownMenu>

          )
        },
      },
    ],
    [updateReqStatus]
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const possibleStatuses = ["Pending", "Approved", "Rejected", "Shipping", "Completed"]
  const [statusSelection, setStatusSelection] = React.useState<string[]>(possibleStatuses)

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 1,
      },
    },
  })

  React.useEffect(() => {
      table.setPageSize(tableData.length); 
  }, [tableData, table]);
  

  React.useEffect(() => {
    table.getColumn("status")?.setFilterValue(statusSelection)
  }, [statusSelection, table])

  return (
    <div className="w-full">
      {/* Filters + Columns Dropdown */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter requests by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Status <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {possibleStatuses.map((status) => {
              const checked = statusSelection.includes(status)
              return (
                <DropdownMenuCheckboxItem
                  key={status}
                  className="capitalize"
                  checked={checked}
                  onCheckedChange={(value) => {
                    setStatusSelection((prev) => {
                      if (value) {
                        return [...prev, status]
                      } else {
                        return prev.filter((s) => s !== status)
                      }
                    })
                  }}
                  onSelect={(event) => {
                    event.preventDefault()
                  }
                  }
                >
                  {status}
                </DropdownMenuCheckboxItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer (Selected Rows Info, etc.) */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>
    </div>
  )
}