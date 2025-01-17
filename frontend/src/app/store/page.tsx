"use client";

import { useState, useEffect } from "react";
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
import { Check, Ticket, ShoppingCart } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { StoreItem, StoreItemCard } from "@/components/ui/store-item-card";

export default function Page() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem("user");

  const [searchQuery, setSearchQuery] = useState("");
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [filteredList, setFilteredList] = useState<StoreItem[]>(storeItems);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAddToCartFeedback, setShowAddToCartFeedback] = useState(false);
  const [showShowPreorderFeedback, setShowPreorderFeedback] = useState(false);

  const [balance, setBalance] = useState(0);

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
        const res = await fetch("http://localhost:8080/store");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setStoreItems(data);
      } catch (error) {
        console.error("Failed to fetch store items:", error);
      }
    };

    const fetchBalance = async () => {
      try {
        const res = await fetch("http://localhost:8080/check-balance", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setBalance(data.balance);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    }

    fetchData();
    fetchBalance();
  }, []);

  const handleCardClick = (item: StoreItem) => {
    console.log("Card clicked:", item.name);
  };

  const handleAddToCart = (e: any, item: StoreItem) => {
    console.log("Cart clicked for:", item.name);
    setIsAnimating(true);
    setShowAddToCartFeedback(true);
    updateUserCart(item);

    // Cart animations
    const cartIcon = e.currentTarget.querySelector("svg");
    cartIcon.style.transform = "scale(0.8)";

    setTimeout(() => {
      cartIcon.style.transform = "scale(1)";
      setIsAnimating(false);
    }, 200);

    setTimeout(() => {
      setShowAddToCartFeedback(false);
    }, 1000);
  };

  // const handleRequestItem = (item: StoreItem) => {
  //   console.log("Request clicked for:", item.name);
  //   setIsAnimating(true);
  //   setShowPreorderFeedback(true);

  //   setTimeout(() => {
  //     setShowPreorderFeedback(false);
  //   }, 1000);
  // };

  const handleRequestItem = async (item: StoreItem) => {
    console.log("Request clicked for:", item.name);
    setIsAnimating(true);
    setShowPreorderFeedback(true);
    const userId = user?.uid;
    const userEmail = user?.email || "Anonymous";
  
    if (!userId) {
      console.error("User is not authenticated.");
      return;
    }
  
    const requestData = {
      userId,
      userEmail,
      itemId: item._id,
      itemName: item.name,
      dateRequested: new Date().toISOString(),
      status: "Pending",
    };
  
    try {
      const res = await fetch("http://localhost:8080/product-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
  
      if (res.ok) {
        const data = await res.json();
        console.log("Request sent successfully:", data);
      } else {
        const errorData = await res.json();
        console.error("Error:", errorData.message);
      }
    } catch (error) {
      console.error("Failed to send request:", error);
    }
  
    setTimeout(() => {
      setShowPreorderFeedback(false);
    }, 1000);
  };
  

  const updateUserCart = async (item: StoreItem) => {
    item.quantity = 1;
    try {
      const res = await fetch("http://localhost:8080/update-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Cart updated:", data);
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  }


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
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
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
              <Ticket size={24} />
              <div>{balance}</div>
            </div>

            <button
              onClick={() => router.push("/cart")}
              className="flex items-center gap-3 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors"
            >
              <ShoppingCart size={24} />
              <span>Cart</span>
            </button>
          </div>
        </div>

        <div className="pb-2 p-1 z-50">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search in store..."
          />
        </div>

        {/* Successful add to cart  */}
        {showAddToCartFeedback && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg">
              <Check className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Added to cart</span>
            </div>
          </div>
        )}

        {/* Successful preorder  */}
        {showShowPreorderFeedback && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg">
              <Check className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Preorder has been sent</span>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
          <div className="gap-3 grid grid-cols-2 sm:grid-cols-3">
            {filteredList.map((item, index) => (
              <StoreItemCard
                key={index}
                item={item}
                onAddToCart={handleAddToCart}
                onRequest={handleRequestItem}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
