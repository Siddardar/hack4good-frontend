"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import DataTable from "./table";
import { AuditLogsTable } from "./AuditLogsTable";

interface AuditLog {
  id: string;
  action: string;
  user: string;
  date: string;
  details: string;
  stockBefore: number;
  stockAfter: number;
}

export default function Page() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
      fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
      try {
          const response = await fetch("http://localhost:8080/audit");
          const data = await response.json();
          setAuditLogs(data); // Set the fetched logs
      } catch (err) {
          console.error("Failed to fetch audit logs", err);
      }
  };

  const addAuditLog = (newLog: AuditLog) => {
      // Update the auditLogs state by adding the new log to the beginning
      setAuditLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Inventory</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <DataTable addAuditLog={addAuditLog} />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h2 className="font-medium p-1">Audit Logs</h2>
          <AuditLogsTable auditLogs={auditLogs} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
