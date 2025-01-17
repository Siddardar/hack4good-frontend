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

// --- Types ---
export type TaskInfo = {
  _id: string
  dateCompleted: any
  description: string
  status: "Pending Review" | "Approved" | "Rejected"
  reward: number
  uid: string
}


export function FinishedTasksTable() {
  const [tableData, setTableData] = React.useState<TaskInfo[]>([])

  const updateTaskStatus = React.useCallback(
    async (taskID: string, newStatus: TaskInfo["status"], uid: string) => {
      try {
        // Step 1: Update the task status in the database
        const res = await fetch("http://localhost:8080/approve-task", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskID, status: newStatus, uid }),
        })
  
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
  
        const data = await res.json()

        setTableData((prevData) =>
          prevData.map((task) =>
            task._id === taskID ? { ...task, status: newStatus } : task
          )
        )
      } catch (error) {
        console.error("Failed to update task status:", error)
      } finally {
        
      }
    },
    []
  )

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/fetch/voucher-tasks-done", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log(data)
        setTableData(data);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      }
    };
    fetchData();
  }, []);

  const columns = React.useMemo<ColumnDef<TaskInfo>[]>(
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
        cell: ({ row }) => <div>{row.getValue("name")}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <div>{row.getValue("status")}</div>,
        filterFn: (row, columnId, value) => {
          if (!value || value.length === 0) return true
          return value.includes(row.getValue(columnId))
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <div>{row.getValue("description")}</div>,
      },
      {
        accessorKey: "reward",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Amount
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(String(row.getValue("reward")))
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)
          return <div>{formatted}</div>
        },
      },
      {
        accessorKey: "dateCompleted",
        header: "Date Completed",
        cell: ({ row }) => {
          const date = new Date(row.getValue("dateCompleted"))
          return <div>{date.toLocaleString()}</div>
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const task = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {task.status === "Pending Review" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => updateTaskStatus(task._id, "Approved", task.uid)}
                    >
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => updateTaskStatus(task._id, "Rejected",   task.uid)}
                    >
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
                {task.status === "Approved" && (
                  <DropdownMenuItem
                    onClick={() => updateTaskStatus(task._id, "Rejected",   task.uid)}
                  >
                    Reject
                  </DropdownMenuItem>
                )}
                {task.status === "Rejected" && (
                  <DropdownMenuItem
                    onClick={() => updateTaskStatus(task._id, "Approved", task.uid)}
                  >
                    Approve
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [updateTaskStatus]
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const possibleStatuses = ["Pending Review", "Approved", "Rejected"]
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
    table.setPageSize(tableData.length)
  }, [table, tableData])

  React.useEffect(() => {
    table.getColumn("status")?.setFilterValue(statusSelection)
  }, [statusSelection, table])

  return (
    <div className="w-full">
      {/* Filters + Columns Dropdown */}
      <div className="flex items-center justify-between py-4">
  <div className="flex flex-col w-full max-w-lg">
    <div className="ml-1 mb-2 text-lg font-semibold">Finished Tasks</div>
    <Input
      placeholder="Filter tasks by name..."
      value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
      onChange={(event) =>
        table.getColumn("name")?.setFilterValue(event.target.value)
      }
      className="w-full"
    />
  </div>
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
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}