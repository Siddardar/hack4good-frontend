"use client"

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface AuditLog {
    id: string;
    action: string;
    user: string;
    date: string;
    details: string;
    stockBefore: number;
    stockAfter: number;
}

interface AuditLogsTableProps {
    auditLogs: AuditLog[];
}

export function AuditLogsTable({ auditLogs }: AuditLogsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Log ID</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Stock Before</TableHead>
                        <TableHead>Stock After</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.id}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.user}</TableCell>
                            <TableCell>{new Date(log.date).toLocaleString()}</TableCell>
                            <TableCell>{log.details}</TableCell>
                            <TableCell className="text-center">{log.stockBefore}</TableCell>
                            <TableCell className="text-center">{log.stockAfter}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
