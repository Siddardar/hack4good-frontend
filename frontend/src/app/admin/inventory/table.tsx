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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { StoreItem } from "@/components/ui/store-item-card";

//Stick to 3 cols because of mobile view

interface AuditLog {
  id: string;
  itemId: string;
  action: string;
  user: string;
  date: string;
  details: string;
  stockBefore: number;
  stockAfter: number;
}

interface DataTableProps {
  addAuditLog: (newLog: AuditLog) => void;
}

const DataTable: React.FC<DataTableProps> = ({ addAuditLog }) => { 
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [storeData, setStoreData] = React.useState<StoreItem[]>([]);
  const [pageSize, setPageSize] = React.useState(1);

  const columns: ColumnDef<StoreItem>[] = [
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
      header: ({ column }) => {
        return <div> Name </div>;
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return <div> Price </div>;
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("price")}</div>
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return <div> Quantity </div>;
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("quantity")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const [dialogOpen, setDialogOpen] = React.useState(false);
  
        const [editItem, setEditItem] = React.useState({
          id: item._id,
          name: item.name,
          img: item.img,
          price: item.price,
          quantity: item.quantity,
          dateAdded: item.dateAdded,
        });
  
        React.useEffect(() => {
          if (!dialogOpen) {
            setEditItem({
              id: item._id,
              name: item.name,
              img: item.img,
              price: item.price,
              quantity: item.quantity,
              dateAdded: item.dateAdded,
            });
          }
        }, [dialogOpen, item]);
  
        const handleSaveChanges = async () => {
          try {

            const timestamp = new Date().toISOString();
            const action = editItem.quantity > item.quantity ? 'Restock' : 'Adjustment';

            const auditLog = {
              id: Date.now().toString(),
              itemId: editItem.id,
              action: action,
              user: 'Admin',
              date: timestamp,
              details: action === 'Restock' 
                ? `Restocked ${editItem.quantity - item.quantity} units of ${editItem.name}` 
                : `Adjusted stock for ${editItem.name} (-${item.quantity - editItem.quantity} unit)`,
              stockBefore: item.quantity,
              stockAfter: editItem.quantity,
            };

            addAuditLog(auditLog);

            await fetch("http://localhost:8080/audit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(auditLog),
            });

            console.log(editItem)
            const res = await fetch("http://localhost:8080/update-item", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(editItem),
            });
  
            setDialogOpen(false);
            setStoreData((prev) => prev.map((item) => (item._id === editItem.id ? { ...editItem, _id: editItem.id } : item)));
          } catch (error) {
            console.error("Failed to save changes", error);
          }
        };
  
        const handleDeleteItem = async (id: string) => {
          console.log(id)
          try {
            const res = await fetch("http://localhost:8080/delete/store", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id }),
            });
      
            const data = await res.json();
            console.log(data);
      
            setStoreData((prev) => prev.filter((item) => item._id !== id));
          } catch (error) {
            console.error("Failed to delete item", error);
          }
        }
  
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
                <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                  Edit Information
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleDeleteItem(item._id)}>
                  <div className="text-red-500 font-semibold">Remove Item</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
  
            {/* Dialog for editing the item */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Information</DialogTitle>
                  <DialogDescription>
                    Edit the item information below.
                  </DialogDescription>
                </DialogHeader>
  
                {/* We do NOT wrap this in a <form> to avoid nested form issues */}
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Item Name
                    </Label>
                    <Input
                      id="item_name"
                      className="col-span-3"
                      value={editItem.name}
                      onChange={(e) =>
                        setEditItem((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="img" className="text-right">
                      Image URL
                    </Label>
                    <Input
                      id="item_description"
                      className="col-span-3"
                      value={editItem.img}
                      onChange={(e) =>
                        setEditItem((prev) => ({ ...prev, img: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Price
                    </Label>
                    <Input
                      id="item_price"
                      className="col-span-3"
                      value={editItem.price}
                      onChange={(e) =>
                        setEditItem((prev) => ({ ...prev, price: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Quantity
                    </Label>
                    <Input
                      id="item_quantity"
                      className="col-span-3"
                      type="number"
                      value={editItem.quantity}
                      onChange={(e) =>
                        setEditItem((prev) => ({
                          ...prev,
                          quantity: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
  
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveChanges}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      },
    },
  ];
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/fetch/store", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setStoreData(data);
        setPageSize(data.length);
      } catch (error) {
        console.error("Failed to fetch store items:", error);
      }
    };

    fetchData();
  }, []);

  const table = useReactTable({
    data: storeData,
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
        pageSize: pageSize,
        pageIndex: 0, 
      },
    },
  });

  React.useEffect(() => {
    table.setPageSize(storeData.length); 
  }, [storeData, table]);

  const [name, setName] = React.useState("");
  const [url, setURL] = React.useState("");
  const [quantity, setQuantity] = React.useState(0);
  const [price, setPrice] = React.useState(0);
  const [date, setDate] = React.useState("");

  const handleCreateItem = async () => {
    console.log(name, url, quantity, price, date);

    const itemData:StoreItem = {
      _id: "",
      name: name,
      img: url,
      quantity: quantity,
      price: price.toString(),
      dateAdded: date,
    }

    try {
      const res = await fetch("http://localhost:8080/add-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
        credentials: "include",
      });

      const data = await res.json();
      console.log(data);

      itemData._id = data.id;

      setStoreData((prev) => [...prev, itemData]);
    } catch (error) {
      console.error("Failed to create item", error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter items..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Add new item
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add new item</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the details of the new item.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* No <form> tag here */}
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  placeholder="Name"
                  defaultValue={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="url">Image URL</Label>
                <Input
                  id="url"
                  placeholder="Img URL"
                  defaultValue={url}
                  onChange={(e) => setURL(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="quantity">Item Quantity</Label>
                <Input
                  id="item_quantity"
                  defaultValue={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  defaultValue={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel className="text-red-500">
                Cancel
              </AlertDialogCancel>
              {/* Use onClick or any handler here */}
              <AlertDialogAction
                className="bg-green-500"
                onClick={handleCreateItem}
              >
                Add item
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
      </div>
    </div>
  );
}

export default DataTable;
