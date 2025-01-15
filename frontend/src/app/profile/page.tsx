"use client";

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
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CircleUser } from "lucide-react";

export default function Page() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem("user");
  const email = userSession + "@random.com";
  console.log({ user });

  useEffect(() => {
    if (!user && !userSession) {
      router.push("/login");
    }
  }, [userSession]);

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
                <BreadcrumbItem>
                  <BreadcrumbPage>Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <div className="flex justify-end mt-4 mr-4">
            <Dialog>
              <DialogTrigger>Edit Profile</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex justify-center my-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src="https://github.com/shadcn.png" />
            </Avatar>
          </div>
          <CardContent>
            <div className="flex justify-center">
              <p className="font-bold text-2xl">
                {sessionStorage.user || "MISSING INFO"}
              </p>
            </div>
            <CardDescription className="flex justify-center items-center gap-2 mt-2">
              <CircleUser className="w-6 h-6" />
              <span className="ml-2 text-lg">ROLE TO BE DISPLAYED HERE</span>
            </CardDescription>

            <CardDescription className="flex justify-center items-center gap-2 mt-2">
              <Mail className="w-6 h-6" />
              <span className="ml-2 text-lg">{email}</span>
            </CardDescription>
          </CardContent>
          <Separator />
          <CardContent>
            <div className="mt-4">
              <CardTitle>Recent Transactions</CardTitle>
            </div>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}
