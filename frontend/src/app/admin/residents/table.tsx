"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar } from "@nextui-org/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { StoreItem } from "@/components/ui/store-item-card";

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


export type ResidentInfo = {
  _id: string;
  amount: number;
  name: string;
  username: string;
  email: string;
  transactions: {
    amount: number;
    date: string;
    description: string;
    status: string;
  }[];
  tasks: {
    dateCompleted: string;
    description: string;
    status: string;
    reward: number;
  }[];
  requests: {
    dateRequested: string;
    description: string;
    status: string;
    amount: number;
  }[];
  cart: StoreItem[];
};


//Stick to 3 cols because of mobile view
export const columns: ColumnDef<ResidentInfo>[] = [
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
    accessorKey: "email",
    header: ({ column }) => {
      return <div> Email </div>;
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            className="p-0 m-0 h-auto w-auto"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="flex items-center gap-1">
              Amount
              <ArrowUpDown />
            </span>
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium mr-2.5">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const resident = row.original;
      const [dialogOpen, setDialogOpen] = React.useState(false);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => console.log(resident.username)}>
                Copy resident username
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  setDialogOpen(true); // Open the AlertDialog
                }}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Reset Password</DropdownMenuItem>
              <DropdownMenuItem>
                <div className="text-red-500 font-semibold">
                  Suspend Resident
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <VisuallyHidden.Root>
                <DialogTitle>Resident Details</DialogTitle>
              </VisuallyHidden.Root>

              {/* Use flex on the DialogHeader. You can also apply spacing & alignment classes. */}
              <DialogHeader className="flex items-center space-x-4 !flex-row !space-y-0 text-left sm:text-left">
                <Avatar
                  size="lg"
                  src="https://i.pravatar.cc/150?u=a04258114e29026302d"
                />
                <div>
                  <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
                    {resident.name}
                  </DialogTitle>
                  <DialogDescription>
                    Balance:{" "}
                    {Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(resident.amount)}
                  </DialogDescription>
                </div>
              </DialogHeader>
              {/* Body of the Dialog */}
              <Tabs defaultValue="account" className="w-[auto] mx-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="requests">Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>
                        Sorted by most recent transaction
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 h-40 md:h-56 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resident.transactions.map((t) => (
                            <TableRow key={t.date}>
                              <TableCell className="font-medium">
                                {t.date}
                              </TableCell>
                              <TableCell>{t.description}</TableCell>
                              <TableCell>{t.status}</TableCell>
                              <TableCell className="text-right">
                                {t.amount}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tasks">
                  <Card>
                    <CardHeader>
                      <CardTitle>Voucher Tasks</CardTitle>
                      <CardDescription>
                        Only tasks pending approval are shown. Oldest to newest.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 h-40 md:h-56 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Reward</TableHead>
                            <TableHead className="text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resident.tasks.map((t) => (
                            <TableRow key={t.dateCompleted}>
                              <TableCell className="font-medium">
                                {t.dateCompleted}
                              </TableCell>
                              <TableCell>{t.description}</TableCell>
                              <TableCell className="text-center">
                                {t.reward}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        console.log("Voucher approved")
                                      }
                                      className="text-green-500 font-semibold"
                                    >
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        console.log("Voucher rejected")
                                      }
                                      className="text-red-500 font-semibold"
                                    >
                                      Reject
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="requests">
                  <Card>
                    <CardHeader>
                      <CardTitle>Requests</CardTitle>
                      <CardDescription>
                        Only pending requests are shown. Oldest to newest.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 h-40 md:h-56 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resident.requests.map((t) => (
                            <TableRow key={t.dateRequested}>
                              <TableCell className="font-medium">
                                {t.dateRequested}
                              </TableCell>
                              <TableCell>{t.description}</TableCell>
                              <TableCell>{t.amount}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        console.log("Request approved")
                                      }
                                      className="text-green-500 font-semibold"
                                    >
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        console.log("Request rejected")
                                      }
                                      className="text-red-500 font-semibold"
                                    >
                                      Reject
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];

export function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const isSmallScreen = useIsMobile();
  
  const [data, setData] = React.useState<ResidentInfo[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/fetch/residents");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error("Failed to fetch store items:", error);
      }
    };

    fetchData();
  }, []);
  

  const columns: ColumnDef<ResidentInfo>[] = [
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
      accessorKey: "email",
      header: ({ column }) => {
        return <div> Email </div>;
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              className="p-0 m-0 h-auto w-auto"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span className="flex items-center gap-1">
                Amount
                <ArrowUpDown />
              </span>
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
  
        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
  
        return <div className="text-right font-medium mr-2.5">{formatted}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const resident = row.original;
        const [dialogOpen, setDialogOpen] = React.useState(false);
  
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => console.log(resident.username)}>
                  Copy resident username
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    setDialogOpen(true); // Open the AlertDialog
                  }}
                >
                  View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Reset Password</DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="text-red-500 font-semibold">
                    Suspend Resident
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="text-red-500 font-semibold">
                    Delete Resident
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <VisuallyHidden.Root>
                  <DialogTitle>Resident Details</DialogTitle>
                </VisuallyHidden.Root>

                <DialogHeader className="flex items-center space-x-4 !flex-row !space-y-0 text-left sm:text-left">
                  <Avatar
                    size="lg"
                    src="https://i.pravatar.cc/150?u=a04258114e29026302d"
                  />
                  <div>
                    <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
                      {resident.name}
                    </DialogTitle>
                    <DialogDescription>
                      Balance:{" "}
                      {Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(resident.amount)}
                    </DialogDescription>
                  </div>
                </DialogHeader>
                {/* Body of the Dialog */}
                <Tabs defaultValue="account" className="w-[auto] mx-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                  </TabsList>
  
                  <TabsContent value="transactions">
                    <Card>
                      <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                          Sorted by most recent transaction
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 h-40 md:h-56 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">Date</TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {resident.transactions.map((t) => (
                              <TableRow key={t.date}>
                                <TableCell className="font-medium">
                                  {t.date}
                                </TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell>{t.status}</TableCell>
                                <TableCell className="text-right">
                                  {t.amount}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
  
                  <TabsContent value="tasks">
                    <Card>
                      <CardHeader>
                        <CardTitle>Voucher Tasks</CardTitle>
                        <CardDescription>
                          Only tasks pending approval are shown. Oldest to newest.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 h-40 md:h-56 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead>Reward</TableHead>
                              <TableHead className="text-center">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {resident.tasks.map((t) => (
                              <TableRow key={t.dateCompleted}>
                                <TableCell className="font-medium">
                                  {t.dateCompleted}
                                </TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell className="text-center">
                                  {t.reward}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                      >
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          console.log("Voucher approved")
                                        }
                                        className="text-green-500 font-semibold"
                                      >
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          console.log("Voucher rejected")
                                        }
                                        className="text-red-500 font-semibold"
                                      >
                                        Reject
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="requests">
                    <Card>
                      <CardHeader>
                        <CardTitle>Requests</CardTitle>
                        <CardDescription>
                          Only pending requests are shown. Oldest to newest.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 h-40 md:h-56 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead>Cost</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {resident.requests.map((t) => (
                              <TableRow key={t.dateRequested}>
                                <TableCell className="font-medium">
                                  {t.dateRequested}
                                </TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell>{t.amount}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                      >
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          console.log("Request approved")
                                        }
                                        className="text-green-500 font-semibold"
                                      >
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          console.log("Request rejected")
                                        }
                                        className="text-red-500 font-semibold"
                                      >
                                        Reject
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </>
        );
  
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
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
  });

    React.useEffect(() => {
      table.setPageSize(data.length); 
    }, [data, table]);

  React.useEffect(() => {
    const emailColumn = table.getColumn("email");
    if (emailColumn) {
      emailColumn.toggleVisibility(!isSmallScreen);
    }
  }, [isSmallScreen, table]);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const handleCreateAccount = async () => {

    try {
      const password = "password123"; 
      
      const createUserResponse = await fetch("http://localhost:8080/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, password }),
      });
  
      if (!createUserResponse.ok) {
        throw new Error("Failed to create user");
      }
      const { id: uid } = await createUserResponse.json();

      const person: ResidentInfo = {
        _id: uid,
        amount: 0,
        name,
        username: name.toLowerCase().replace(" ", "_"),
        email,
        transactions: [],
        tasks: [],
        requests: [],
        cart: [],
      }

      const res = await addUserToDatabase(person);

      setData([...data, person]);

    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const addUserToDatabase = async (person: ResidentInfo) => {
    try {
      const addResidentResponse = await fetch("http://localhost:8080/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(person),
      });
  
      if (!addResidentResponse.ok) {
        throw new Error("Failed to add resident");
      }
      return addResidentResponse;
    } catch (error) {
      console.error("Failed to add resident:", error);
      return error
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter residents..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Create new account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create a new residents account</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the details of the new resident.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateAccount();
          }}
        >
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Resident Name</Label>
              <Input
                id="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Resident Email</Label>
              <Input
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </form>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-red-500">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-green-500"
            onClick={handleCreateAccount}
            
          >
            Create Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
      </div>
    </div>
  );
}
