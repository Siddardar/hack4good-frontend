"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
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
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableFooter,
} from "@/components/ui/table";
import { format } from "date-fns"

export default function Page() {

    const searchParams = useSearchParams()

    const from = searchParams.get("from") || "2025-01-01";
    const to = searchParams.get("to") || "2025-01-15";

    const [requestSummary] = useState([
        { name: "Item A", accepted: 15, rejected: 3, pending: 5, shipping: 8 },
        { name: "Item B", accepted: 10, rejected: 1, pending: 2, shipping: 4 },
        { name: "Item C", accepted: 8, rejected: 0, pending: 6, shipping: 3 },
    ]);

    const inventorySummary = [
        { name: "Item A", stockLevelStart: 60, stockLevelEnd: 50 },
        { name: "Item B", stockLevelStart: 25, stockLevelEnd: 20 },
        { name: "Item C", stockLevelStart: 15, stockLevelEnd: 20 },
    ];

    const exportToExcel = async () => {
        const response = await fetch('http://localhost:8080/export-report', {
            method: 'GET',
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'report.xlsx';
            link.click();
        }
    };

    const totalAccepted = requestSummary.reduce((sum, item) => sum + item.accepted, 0);
    const totalRejected = requestSummary.reduce((sum, item) => sum + item.rejected, 0);
    const totalPending = requestSummary.reduce((sum, item) => sum + item.pending, 0);
    const totalShipping = requestSummary.reduce((sum, item) => sum + item.shipping, 0);

    const totalStockStart = inventorySummary.reduce((sum, item) => sum + item.stockLevelStart, 0);
    const totalStockEnd = inventorySummary.reduce((sum, item) => sum + item.stockLevelEnd, 0);
    const totalStockChange = totalStockEnd - totalStockStart;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center gap-2">
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

                <section className="px-4 py-2 bg-gray-50 border-b flex justify-between">
                    <div>
                        <h2 className="px-4 py-2 text-lg font-semibold">Report Overview</h2>
                        <p className="px-4 py-2">
                        <span>
                            {format(new Date(from), "LLL dd, y")} - {format(new Date(to), "LLL dd, y")}
                        </span>
                        </p>
                    </div>
                    <div className="flex items-center px-4 py-2">
                        <Button onClick={exportToExcel}>Export to Excel</Button>
                    </div>
                </section>

                <main className="px-4 py-4 space-y-8">
                    <section className="px-4 py-4">
                        <h2 className="text-md font-medium py-2">Requests summary</h2>
                        <div className="border rounded-md max-w-[1000px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-center">Accepted</TableHead>
                                        <TableHead className="text-center">Rejected</TableHead>
                                        <TableHead className="text-center">Pending</TableHead>
                                        <TableHead className="text-center">Shipping</TableHead>
                                        <TableHead className="text-center">Total Requests</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requestSummary.map((item) => {
                                        const totalRequests = item.accepted + item.rejected + item.pending + item.shipping;
                                        return (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-center">{item.accepted}</TableCell>
                                                <TableCell className="text-center">{item.rejected}</TableCell>
                                                <TableCell className="text-center">{item.pending}</TableCell>
                                                <TableCell className="text-center">{item.shipping}</TableCell>
                                                <TableCell className="text-center font-bold">{totalRequests}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={1} className="font-medium">
                                            All items
                                        </TableCell>
                                        <TableCell className="text-center font-bold">{totalAccepted}</TableCell>
                                        <TableCell className="text-center font-bold">{totalRejected}</TableCell>
                                        <TableCell className="text-center font-bold">{totalPending}</TableCell>
                                        <TableCell className="text-center font-bold">{totalShipping}</TableCell>
                                        <TableCell className="text-center font-bold">
                                            {totalAccepted + totalRejected + totalPending + totalShipping}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </section>

                    <section className="px-4 py-4">
                        <h2 className="text-md font-medium py-2">Inventory summary</h2>
                        <div className="border rounded-md max-w-[1000px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-center">Stock Level (Start Date)</TableHead>
                                        <TableHead className="text-center">Stock Level (End Date)</TableHead>
                                        <TableHead className="text-center">Change</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventorySummary.map((item) => {
                                        const change = item.stockLevelEnd - item.stockLevelStart;
                                        return (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-center">{item.stockLevelStart}</TableCell>
                                                <TableCell className="text-center">{item.stockLevelEnd}</TableCell>
                                                <TableCell
                                                    className={`text-center font-bold ${change < 0 ? "text-red-600" : "text-green-600"
                                                        }`}
                                                >
                                                    {change}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            All items
                                        </TableCell>
                                        <TableCell className="text-center font-bold">{totalStockStart}</TableCell>
                                        <TableCell className="text-center font-bold">{totalStockEnd}</TableCell>
                                        <TableCell className="text-center font-bold">
                                            {totalStockChange}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </section>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}