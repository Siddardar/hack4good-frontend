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
import { ShoppingBasket, ArrowUp, Check } from 'lucide-react';
import CartItem from "@/components/ui/clickable-cart-item"

export default function Page() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem("user");
  const [list, setList] = useState([
    { title: "Orange", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 5.5, isSelected: false, isAvailable: true, quantity: 1, description: "2 kg of fresh Australian Orange " },
    { title: "Tangerine", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 3, isSelected: false, isAvailable: true, quantity: 1  },
    { title: "Raspberry", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 10, isSelected: false, quantity: 1 },
    { title: "Lemon", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 5.3, isSelected: false, isAvailable: true, quantity: 1  },
    { title: "Avocado", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 15.7, isSelected: false, isAvailable: true, quantity: 1  },
    { title: "Lemon 2", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 8, isSelected: false, quantity: 1 },
    { title: "Banana", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 7.5, isSelected: false, isAvailable: true, quantity: 1  },
    { title: "Lemon 3", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 9, isSelected: false, quantity: 1  },
    { title: "Banana 2", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 9.2, isSelected: false, isAvailable: true, quantity: 1  },
    { title: "Watermelon", img: "https://healthnewshub.org/wp-content/uploads/2022/10/Fruit-e1664894335635.jpg", 
        price: 12.9, isSelected: false, isAvailable: true, quantity: 1  },
  ]);
  const [selectedList, setSelectedList] = useState([]); 
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const totalPrice = list.reduce(
    (total, item) =>
      item.isSelected ? total + parseFloat(item.price) * item.quantity : total,
    0
  );
  const handleCheckboxChange = (index) => {
    const updatedList = list.map((item, i) =>
      i === index ? { ...item, isSelected: !item.isSelected } : item
    );
    setList(updatedList); // Update the displayed list
    setSelectedList(updatedList.filter((item) => item.isSelected)); // Update the selected list
  };  
  const handleCheckout = () => {
    console.log("Checking out:", selectedList);
  };
  const handleQuantityChange = (index, newQuantity) => {
    const updatedList = [...list];
    updatedList[index].quantity = newQuantity;
    setList(updatedList);
  };
  const handleDelete = (e, item) => {
    const updatedList = list.filter((i) => i !== item);
    setList(updatedList);
  
    const updatedSelectedList = selectedList.filter((i) => i !== item);
    setSelectedList(updatedSelectedList);
  
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
                <ShoppingBasket size={20} />
                <span>Visit the store</span>
            </button>
            </div>
        ) : (
            <div className="grid gap-2 pb-4 relative">
            {list.map((item, index) => (
                <CartItem
                key={index}
                item={item}
                index={index}
                onDelete={(item) => handleDelete(null, item)}
                onCheckboxChange={handleCheckboxChange}
                onQuantityChange={handleQuantityChange}
                />
            ))}

        {/* Scroll to top button */}
      
            </div>
        )}
        </div>

        {/* Summary Section */}
        <div className="sticky p-4 border-t border-gray-200 bg-white bottom-0">
        <div className="flex justify-between items-center mb-4">
            <p className="text-lg">
            Items selected: {selectedList.length}
            </p>
            <p className="text-lg font-semibold">${totalPrice.toFixed(2)}</p>
        </div>
        <button
            className="w-full bg-zinc-800 hover:bg-black text-white py-2 rounded-lg text-lg font-semibold"
            onClick={handleCheckout}
        >
            Checkout
        </button>
        </div>

      </SidebarInset>
    </SidebarProvider>

  );
}
