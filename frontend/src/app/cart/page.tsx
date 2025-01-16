"use client";

import { useState } from "react";
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
import { ShoppingBasket, ArrowUp, Check, Trash2 } from 'lucide-react';
import { SearchBar } from "@/components/ui/search-bar";

export default function Page() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem("user");
  const [list, setList] = useState([
    { title: "Orange", img: "https://nextui.org/images/fruit-1.jpeg", price: "$5.50", description: "2 kg of fresh Australian Orange ", isSelected: false, isAvailable: true },
    { title: "Tangerine", img: "https://nextui.org/images/fruit-1.jpeg", price: "$3.00", isSelected: false, isAvailable: true  },
    { title: "Raspberry", img: "https://nextui.org/images/fruit-1.jpeg", price: "$10.00", isSelected: false },
    { title: "Lemon", img: "https://nextui.org/images/fruit-1.jpeg", price: "$5.30", isSelected: false, isAvailable: true  },
    { title: "Avocado", img: "https://nextui.org/images/fruit-1.jpeg", price: "$15.70", isSelected: false, isAvailable: true  },
    { title: "Lemon 2", img: "https://nextui.org/images/fruit-1.jpeg", price: "$8.00", isSelected: false },
    { title: "Banana", img: "https://nextui.org/images/fruit-1.jpeg", price: "$7.50", isSelected: false, isAvailable: true  },
    { title: "Lemon 3", img: "https://nextui.org/images/fruit-1.jpeg", price: "$8.00", isSelected: false  },
    { title: "Banana 2", img: "https://nextui.org/images/fruit-1.jpeg", price: "$7.50", isSelected: false, isAvailable: true  },
    { title: "Watermelon", img: "https://nextui.org/images/fruit-1.jpeg", price: "$12.20", isSelected: false, isAvailable: true  },
  ]);
  const [selectedList, setSelectedList] = useState([]); 
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const handleCheckboxChange = (index) => {
    const updatedList = list.map((item, i) =>
      i === index ? { ...item, isSelected: !item.isSelected } : item
    );
    setList(updatedList); // Update the main list
    setSelectedList(updatedList.filter((item) => item.isSelected)); // Update the selected list
  };  
  const handleCheckout = () => {
    console.log("Checking out:", selectedList);
  };
  const handleRequest = (e, item) => {
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
    }, 1000);
  };
  const handleDelete = (e, item) => {
    setList((prevList) => prevList.filter((i) => i !== item)); 
    setShowFeedback(true);

    setTimeout(() => {
        setShowFeedback(false);
    }, 1000);
  };
  const scrollToTop = () => {
    const scrollContainer = document.getElementById('cart-items');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target;
      setShowScrollTop(target.scrollTop > 100);
    };

    const scrollContainer = document.getElementById('cart-items');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

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
                  <BreadcrumbPage>Cart</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="px-6">
          <div className="flex justify-end gap-3 items-center mb-4">
            {/* Store Button */}
            <button 
                onClick={() => router.push('/store')}
                className="flex items-center gap-3 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors"
            >
              <ShoppingBasket size={24} />
              <span>Store</span>
            </button>
            </div>
          </div>

        {/* Centered feedback message if request is sent */}
        {showFeedback && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg">
              <Check className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Request sent</span>
            </div>
          </div>
        )}

        {/* Centered feedback message if delete is clicked */}
        {showFeedback && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg">
              <Check className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Item removed</span>
            </div>
          </div>
        )}

        {/* Cart Items Section */}
        <div id="cart-items" className="flex-1 overflow-y-auto px-6 relative">
        {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-xl text-gray-500">Your cart is empty</p>
            <button 
                onClick={() => router.push('/store')}
                className="flex items-center gap-2 bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors"
            >
                <Store size={20} />
                <span>Visit the store</span>
            </button>
            </div>
        ) : (
            <div className="grid gap-2 pb-4 relative">
            {list.map((item, index) => (
                <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                <div className="flex items-center gap-4">
                    {/* Checkbox or Delete */}
                    <div className="h-5 w-5">
                        {item.isAvailable ? (
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded-full cursor-pointer accent-zinc-800"
                            checked={item.isSelected}
                            onChange={() => handleCheckboxChange(index)}
                        />
                        ) : (
                        <button 
                            onClick={(e) => handleDelete(e, item)}
                        >
                            <Trash2 size={20} className="text-zinc-500" />
                        </button>
                        )}
                    </div>

                    {/* Item Image */}
                    <img
                    src={item.img}
                    alt={item.title}
                    className={`w-20 h-20 object-cover rounded-lg ${!item.isAvailable ? "grayscale opacity-50" : ""}`}
                    />

                    {/* Item Details */}
                    <div className="flex flex-col flex-1 line-clamp-2">
                    <b className="text-lg truncate">{item.title}</b>
                    <p className="text-gray-500 text-sm overflow-hidden text-ellipsis line-clamp-2">{item.description}</p>
                    </div>

                    {/* Price and Request Button */}
                    <div className="flex flex-col items-center justify-center gap-2 min-w-[100px] shrink-0">
                    <p className="text-lg font-semibold">{item.price}</p>
                    {/* {!item.isAvailable && (
                        <button 
                            className="px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                            onClick={(e) => handleRequest(e, item)}
                        >
                        Request
                        </button>
                    )} */}
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

        {/* Scroll to top button */}
        {showScrollTop && (
            <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
            <ArrowUp size={20} />
            </button>
        )}
        </div>

        {/* Summary Section */}
        <div className="sticky p-4 border-t border-gray-200 bg-white bottom-0">
            <div className="flex justify-between items-center mb-4">
                <p className="text-lg">
                        Items selected: {selectedList.length}
                </p>
                <p className="text-lg font-semibold">
                    Total: $
                    {selectedList
                        .reduce((total, item) => total + parseFloat(item.price.slice(1)), 0)
                        .toFixed(2)}
                </p>
            </div>
            <button
                className="w-full bg-zinc-800 hover:bg-black text-white py-2 rounded-lg text-lg font-semibold"
                onClick={handleCheckout}                >
                Checkout
            </button>
        </div>

      </SidebarInset>
    </SidebarProvider>

  );
}
