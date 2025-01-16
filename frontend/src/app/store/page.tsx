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
import { ShoppingCart, Check, Receipt } from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";

export default function Page() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userlocal = localStorage.getItem("user");
  const list = [
    {
      title: "Orange",
      img: "https://nextui.org/images/fruit-1.jpeg",
      price: "$5.50",
    },
    {
      title: "Tangerine",
      img: "https://nextui.org/images/fruit-1.jpeg",
      price: "$3.00",
    },
    {
      title: "Raspberry",
      img: "https://nextui.org/images/fruit-1.jpeg",
      price: "$10.00",
    },
    {
      title: "Lemon",
      img: "https://nextui.org/images/fruit-1.jpeg",
      price: "$5.30",
    },
    {
      title: "Avocado",
      img: "https://nextui.org/images/fruit-1.jpeg",
      price: "$15.70",
    },
    {
      title: "Lemon 2",
      img: "https://nextui.org/images/fruit-1.jpeg",
      price: "$8.00",
    },
    {
      title: "Banana",
      img: "https://nextui.org/images/fruit-1.jpeg",
      price: "$7.50",
    },
    {
      title: "Watermelon",
      img: "https://nextui.org/images/fruit-1.jpeg",
      price: "$12.20",
    },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredList, setFilteredList] = useState(list);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const handleCardClick = (item) => {
    console.log("Card clicked:", item.title);
  };
  const handleAddToCart = (e, item) => {
    console.log("Cart clicked for:", item.title);
    setIsAnimating(true);
    setShowFeedback(true);

    // Cart animation
    const cartIcon = e.currentTarget.querySelector("svg");
    cartIcon.style.transform = "scale(0.8)";

    setTimeout(() => {
      cartIcon.style.transform = "scale(1)";
      setIsAnimating(false);
    }, 200);

    setTimeout(() => {
      setShowFeedback(false);
    }, 1000);
  };

  useEffect(() => {
    if (!user && !userlocal) {
      router.push("/login");
    }
  }, [userlocal]);

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

        <div className="px-4">
          <div className="flex justify-end gap-3 items-center mb-4">
            {/* Balance Box */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
              <Receipt size={24} />
              <div>
                <div>$1,234.56</div>
              </div>
            </div>

            {/* Cart Button */}
            <button className="flex items-center gap-3 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors">
              <ShoppingCart size={24} />
              <span>Cart (0)</span>
            </button>
          </div>
        </div>

        <div className="px-4 pb-4">
          {/* Search bar with icon on the left */}
          <div className="flex border border-gray-300 rounded-3xl">
            <button className="ml-2 p-3 flex items-center justify-center">
              <GoSearch size={20} color="gray-300" />
            </button>
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Centered feedback message */}
        {showFeedback && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg">
              <Check className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Added to cart</span>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Card Grid */}
          <div className="gap-5 grid grid-cols-2 sm:grid-cols-3">
            {filteredList.map((item, index) => (
              /* eslint-disable no-console */
              <Card
                key={index}
                // isPressable
                shadow="sm" // shadow for the whole card
                onPress={() => handleCardClick(item)}
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
                <CardFooter className="text-small flex justify-between items-center">
                  <div className="flex flex-col">
                    <b>{item.title}</b>
                    <p className="text-default-500 items-left">{item.price}</p>
                  </div>
                  <button
                    className="flex items-center cursor-pointer mr-2 transition-transform isAnimating ? 'scale-95' : 'scale-100'"
                    onClick={(e) => handleAddToCart(e, item)}
                  >
                    <ShoppingCart size={24} color="gray" />
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
