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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"

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
export type AllTasksInfo = {
  _id: string
  dateAdded: string
  desc: string
  reward: number
  staffName: string
}

export function AllTasksTable() {

  const columns:ColumnDef<AllTasksInfo>[] = [
    
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
        accessorKey: "staffName",
        header: "Name",
        cell: ({ row }) => <div className="capitalize">{row.getValue("staffName")}</div>,
      },
      {
        accessorKey: "dateAdded",
        header: () => <div>Date Added</div>,
        cell: ({ row }) => <div>{row.getValue("dateAdded")}</div>,
      },
      {
        accessorKey: "desc",
        header: () => <div>Description</div>,
        cell: ({ row }) => <div>{row.getValue("desc")}</div>,
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    deleteTask(task._id)
                  }}
                >
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
  ]

  const [tasks, setTasks] = React.useState<AllTasksInfo[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/fetch/voucher-tasks");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const sortedTasks = data.sort((a: AllTasksInfo, b: AllTasksInfo) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        setTasks(sortedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };
  
    fetchData();
  }, []);

  const table = useReactTable({
    data: tasks,
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
        pageSize: 3,
      },
    },
  })

  const [name, setName] = React.useState("")
  const [desc, setDesc] = React.useState("")
  const [amt, setAmt] = React.useState("")

  const createTask = async (name: string, desc: string, amt: string) => {
    if (!name || !desc || !amt) {
      console.error("All fields are required")
      return
    }

    var newTask: AllTasksInfo = {
      _id: "0",
      dateAdded: new Date().toISOString().split("T")[0],
      desc: desc,
      reward: parseFloat(amt),
      staffName: name,
    }
    
    const res = await fetch("http://localhost:8080/add-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    })

    if (res.ok) {
      console.log("Task created successfully")
      res.json().then((data) => {
        newTask = { ...newTask, _id: data.id }
        setTasks((prevTasks) => {
          const updatedTasks = [...prevTasks, newTask].sort(
            (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
          return updatedTasks;
        });

        console.log("Task created:", newTask)
      })

    } else {
      console.error("Failed to update task in db")
    }
    
  }

  const deleteTask = async (id:string) => {
    const res = await fetch("http://localhost:8080/delete/voucher-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      console.log("Task deleted successfully")
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.filter((task) => task._id !== id);
        return updatedTasks;
      });
    } else {
      console.error("Failed to delete task in db")
    }
  }

  return (
    <div className="w-full">
      {/* Filters + Columns Dropdown */}
      <div className="flex items-center justify-between py-4">
  {/* Title and Input */}
  <div className="flex flex-col w-full max-w-lg">
    <div className="ml-1 mb-2 text-lg font-semibold">All Tasks</div>
    <Input
      placeholder="Filter tasks by staff name..."
      value={(table.getColumn("staffName")?.getFilterValue() as string) ?? ""}
      onChange={(event) =>
        table.getColumn("staffName")?.setFilterValue(event.target.value)
      }
      className="w-full"
    />
  </div>

    {/* Button */}
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="ml-4">
          Create new Task
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create a new task</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the details of the task.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createTask(name, desc, amt);
          }}
        >
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Staff Name</Label>
              <Input
                id="name"
                placeholder="Name of staff creating task"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Task Description</Label>
              <Input
                id="desc"
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Reward Amount</Label>
              <Input
                id="amt"
                placeholder="Amount"
                value={amt}
                onChange={(e) => setAmt(e.target.value)}
              />
            </div>
          </div>
        </form>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-red-500">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-green-500"
            onClick={() => createTask(name, desc, amt)}
          >
            Create Task
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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