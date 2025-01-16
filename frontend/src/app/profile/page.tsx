"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import React, { useEffect, useState } from "react";
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
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateEmail,
  updatePassword,
} from "firebase/auth";

export default function Page() {
  const [user] = useAuthState(auth);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const tempUser = localStorage.getItem("user");
  const tempEmail = localStorage.getItem("user") + "@random.com";
  const userlocal = localStorage.getItem("user");
  const currentUser = auth.currentUser;
  const router = useRouter();
  console.log({ user });

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("saved");
    try {
      setUsername(
        (document.getElementById("newName") as HTMLInputElement)?.value || ""
      );
      setEmail(
        (document.getElementById("newName") as HTMLInputElement)?.value +
          "@random.com" || ""
      );
      setPassword(
        (document.getElementById("newPassword") as HTMLInputElement)?.value ||
          ""
      );
      if (currentUser) {
        const credential = EmailAuthProvider.credential(
          currentUser.email || "",
          (document.getElementById("oldPassword") as HTMLInputElement)?.value ||
            ""
        );
        const res = await reauthenticateWithCredential(currentUser, credential);
        updateEmail(currentUser, email);
        updatePassword(currentUser, password);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // const updateDb = () => {
  //   try {
  //     if (currentUser) {
  //       const NAME = username + "@gmail.com";
  //       console.log(email);

  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  useEffect(() => {
    if (!user && !userlocal) {
      router.push("/login");
    }
  }, [userlocal]);

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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're
                    done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newName" className="text-right">
                      Username
                    </Label>
                    <Input id="newName" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="oldPassword" className="text-right">
                      Old Password
                    </Label>
                    <Input
                      id="oldPassword"
                      type="text"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newPassword" className="text-right">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="text"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={(e) => {
                      handleSave(e);
                      setOpen(false);
                    }}
                  >
                    Save changes
                  </Button>
                </DialogFooter>
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
                {!username ? tempUser : username}
              </p>
            </div>
            <CardDescription className="flex justify-center items-center gap-2 mt-2">
              <CircleUser className="w-6 h-6" />
              <span className="ml-2 text-sm">ROLE TO BE DISPLAYED HERE</span>
            </CardDescription>

            <CardDescription className="flex justify-center items-center gap-2 mt-2">
              <Mail className="w-6 h-6" />
              <span className="ml-2 text-sm">{!email ? tempEmail : email}</span>
            </CardDescription>
          </CardContent>
          <Separator />
          <CardContent>
            <div className="mt-4">
              <CardTitle>Purchase History</CardTitle>
            </div>
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}
