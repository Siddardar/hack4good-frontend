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
import { send } from "process"

// --- Types ---
export type TaskInfo = {
  _id: string
  dateCompleted: string
  description: string
  status: "In Progress" | "Pending Review" | "Rejected" | "Approved"
  reward: number
  name: string
}

export function MyTasksTable() {
  const [tableData, setTableData] = React.useState<TaskInfo[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/my-tasks", {
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

  const updateTaskStatus = React.useCallback(
    (taskID: string, newStatus: TaskInfo["status"]) => {
      setTableData((prevData) =>
        prevData.map((task) =>
          task._id === taskID ? { ...task, status: newStatus } : task
        )
      )
    },
    []
  )

  function sendForReview(task: TaskInfo): void {
    updateTaskStatus(task._id, "Pending Review")
    

    const sendToDB = async () => {
        try {
            const res = await fetch("http://localhost:8080/submit-task", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
            });
            if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log("Updated task status:", data);
        } catch (error) {
            console.error("Failed to update task status:", error);
        }
    };

    const updateTaskinDB = async () => {
        try {
            const res = await fetch("http://localhost:8080/update-task", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
            },
            body: JSON.stringify({taskID: task._id, status: "Pending Review" }),
            });
            if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log("Updated task status:", data);
        } catch (error) {
            console.error("Failed to update task status:", error);
        }
    }

    sendToDB();
    updateTaskinDB();
  }


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
        header: "Staff Name",
        cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "status",
        header: () => <div>Status</div>,
        cell: ({ row }) => <div>{row.getValue("status")}</div>,
        filterFn:(row, col, value) => {
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
        accessorKey: "reward",
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
                Amount
                <ArrowUpDown />
              </span>
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("reward"))
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
          const task = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              {task.status === "In Progress" && (
              <DropdownMenuContent align="end">
                {/* Show the appropriate dropdown items based on task.status */}
                
                  <>
                    <DropdownMenuItem
                      onClick={() => sendForReview(task)}
                    >
                      Send for review
                    </DropdownMenuItem>
                  </>
                

              </DropdownMenuContent>
           )}
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
    console.log(tableData.length)
    
  }, [table, tableData]);


  return (
    <div className="w-full">
      {/* Filters + Columns Dropdown */}
      <div className="flex items-center justify-between py-4">
  <div className="flex flex-col w-full max-w-lg">
    <div className="ml-1 mb-2 text-lg font-semibold">My Tasks</div>
    <Input
      placeholder="Filter tasks by name..."
      value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
      onChange={(event) =>
        table.getColumn("name")?.setFilterValue(event.target.value)
      }
      className="w-full"
    />
  </div>
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