"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
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
import { format } from "date-fns";

export default function Page() {

    const searchParams = useSearchParams()

    const from = searchParams.get("from") || "2025-01-01";
    const to = searchParams.get("to") || "2025-01-15";

    type RequestItem = {
        _id: string;
        userId: string;
        userEmail: string;
        itemId: string;
        itemName: string;
        dateRequested: string;
        status: string;
    }

    type ApiResponse = {
        requests: RequestItem[];
    }

    type RequestSummaryItem = {
        name: string;
        accepted: number;
        rejected: number;
        pending: number;
    }

    const [requestSummary, setRequestSummary] = useState<RequestSummaryItem[]>([]);

    useEffect(() => {
        const fetchRequestData = async () => {
            try {
                const response = await fetch("http://localhost:8080/product-request-by-date", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        startDate: from,
                        endDate: to,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch request data');
                }

                const rawData: ApiResponse = await response.json();
                console.log('Raw API response:', rawData);

                if (!rawData.requests || !Array.isArray(rawData.requests)) {
                    throw new Error('Invalid data format received from API');
                }

                // Process the data to create a summary
                const summaryMap = new Map<string, RequestSummaryItem>();

                rawData.requests.forEach(request => {
                    if (!request.itemName) {
                        console.warn('Request missing itemName:', request);
                        return;
                    }

                    if (!summaryMap.has(request.itemName)) {
                        summaryMap.set(request.itemName, {
                            name: request.itemName,
                            accepted: 0,
                            rejected: 0,
                            pending: 0,
                        });
                    }

                    const summary = summaryMap.get(request.itemName)!;
                    switch (request.status?.toLowerCase()) {
                        case 'accepted':
                            summary.accepted += 1;
                            break;
                        case 'rejected':
                            summary.rejected += 1;
                            break;
                        case 'pending':
                            summary.pending += 1;
                            break;
                        default:
                            console.warn('Unknown status:', request.status);
                    }
                });

                setRequestSummary(Array.from(summaryMap.values()));
            } catch (error) {
                console.error('Error fetching request data:', error);
                setRequestSummary([]);
            }
        };

        fetchRequestData();
    }, [from, to]);

    type inventorySummaryItem = {
        name: string;
        stockLevelAtStart: number;
        stockLevelAtEnd: number;
    };

    const [inventorySummary, setInventorySummary] = useState<inventorySummaryItem[]>([]);

    useEffect(() => {
        const fetchInventorySummary = async () => {
            const response = await fetch("http://localhost:8080/generate-inventory-summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startDate: from,
                    endDate: to,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setInventorySummary(Object.values(data.report));
            } else {
                console.error("Failed to fetch inventory summary");
            }
        };

        fetchInventorySummary();
    }, [from, to]);

    const exportToExcel = async () => {
        
        const response = await fetch('http://localhost:8080/export-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate: from,
                endDate: to,
            })
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

    const totalStockStart = inventorySummary.reduce((sum, item) => sum + item.stockLevelAtStart, 0);
    const totalStockEnd = inventorySummary.reduce((sum, item) => sum + item.stockLevelAtEnd, 0);
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
                                        <TableHead className="text-center">Total Requests</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requestSummary.map((item) => {
                                        const totalRequests = item.accepted + item.rejected + item.pending;
                                        return (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-center">{item.accepted}</TableCell>
                                                <TableCell className="text-center">{item.rejected}</TableCell>
                                                <TableCell className="text-center">{item.pending}</TableCell>
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
                                        <TableCell className="text-center font-bold">
                                            {totalAccepted + totalRejected + totalPending}
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
                                        const change = item.stockLevelAtEnd - item.stockLevelAtStart;
                                        return (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-center">{item.stockLevelAtStart}</TableCell>
                                                <TableCell className="text-center">{item.stockLevelAtEnd}</TableCell>
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