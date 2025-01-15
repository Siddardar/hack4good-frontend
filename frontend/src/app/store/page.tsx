"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
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
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import { GoSearch } from "react-icons/go";

export default function Page() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem("user");
  const list = [
    { title: "Orange", img: "https://nextui.org/images/fruit-1.jpeg", price: "$5.50" },
    { title: "Tangerine", img: "https://nextui.org/images/fruit-1.jpeg", price: "$3.00" },
    { title: "Raspberry", img: "https://nextui.org/images/fruit-1.jpeg", price: "$10.00" },
    { title: "Lemon", img: "https://nextui.org/images/fruit-1.jpeg", price: "$5.30" },
    { title: "Avocado", img: "https://nextui.org/images/fruit-1.jpeg", price: "$15.70" },
    { title: "Lemon 2", img: "https://nextui.org/images/fruit-1.jpeg", price: "$8.00" },
    { title: "Banana", img: "https://nextui.org/images/fruit-1.jpeg", price: "$7.50" },
    { title: "Watermelon", img: "https://nextui.org/images/fruit-1.jpeg", price: "$12.20" },
  ];
  const [searchQuery, setSearchQuery] = useState(""); 
  const [filteredList, setFilteredList] = useState(list);

  useEffect(() => {
    if (!user && !userSession) {
      router.push("/login");
    }
  }, [userSession]);

  useEffect(() => {
    setFilteredList(
      list.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

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
                  <BreadcrumbPage>Store</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="p-4">
          {/* Search bar */}
          <div className="flex">
          <input
            type="text"
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-3xl"
          />

          <button
            onClick={() => console.log("Search icon clicked")}
            className="ml-2 p-3 bg-gray-200 rounded-xl flex items-center justify-center"
          >
            <GoSearch size={20} color="gray-300" />
          </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Card Grid */}
          <div className="gap-5 grid grid-cols-2 sm:grid-cols-3">
            {filteredList.map((item, index) => (
              /* eslint-disable no-console */
              <Card
                key={index}
                isPressable
                shadow="sm" // shadow for the whole card
                onPress={() => console.log("item pressed")}
              >
                <CardBody className="overflow-visible p-0">
                  <Image
                    alt={item.title}
                    className="w-full object-cover h-[180px]"
                    radius="lg" 
                    src={item.img}
                    width="100%"
                  />
                </CardBody>
                <CardFooter className="text-small justify-between">
                  <b>{item.title}</b>
                  <p className="text-default-500">{item.price}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
