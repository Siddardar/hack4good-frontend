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
import { ShoppingCart, Check, Receipt } from 'lucide-react';
import { SearchBar } from "@/components/ui/search-bar";

import { onAuthStateChanged } from "firebase/auth";

export type StoreItem = {
  _id: string;
  name: string;
  price: string;
  img: string;
  quantity: number;
  dateAdded: string;
};


export default function Page() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem("user");

  const [searchQuery, setSearchQuery] = useState(""); 

  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [filteredList, setFilteredList] = useState<StoreItem[]>(storeItems); 
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const handleCardClick = (item: StoreItem) => {
    console.log("Card clicked:", item.name);
  };
  const handleAddToCart = (e:any, item:StoreItem) => {
    console.log("Cart clicked for:", item.name);
    setIsAnimating(true);
    setShowFeedback(true);

    // Cart animations
    const cartIcon = e.currentTarget.querySelector('svg');
    cartIcon.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      cartIcon.style.transform = 'scale(1)';
      setIsAnimating(false);
    }, 200);

    setTimeout(() => {
      setShowFeedback(false);
    }, 1000);
  };

  useEffect(() => {
    if (!user && !userSession) {
      router.push("/login");
    }

  }, [userSession]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredList(storeItems);
    } else {
      setFilteredList(
        storeItems.filter((item: StoreItem) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, storeItems]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/fetch/store");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setStoreItems(data);
      } catch (error) {
        console.error("Failed to fetch store items:", error);
      }
    };
  
    fetchData();
  }, []);

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

        <div className="px-6">
          <div className="flex justify-end gap-3 items-center mb-4">
            {/* Balance Box */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
              <Receipt size={24} />
              <div>
                <div>$1,234.56</div>
              </div>
            </div>

            {/* Cart Button */}
            <button 
              onClick={() => router.push('/cart')}
              className="flex items-center gap-3 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors"
            >
              <ShoppingCart size={24} />
              <span>Cart</span>
            </button>
            </div>
          </div>

        {/* Search bar */}
        <div className="pb-2 p-1 z-50">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search in store..."
          />  
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

        <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
          {/* Card Grid */}
          <div className="gap-3 grid grid-cols-2 sm:grid-cols-3">
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
                    alt={item.name}
                    className="w-full object-cover h-[180px]"
                    radius="lg" 
                    src={item.img}
                    width="100%"
                  />
                </CardBody>
                <CardFooter className="text-small flex justify-between items-center">
                  <div className="flex flex-col">
                    <b>{item.name}</b>
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
