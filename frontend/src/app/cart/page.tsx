"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useRouter } from "next/navigation";
import { ShoppingBasket, Check } from "lucide-react";
import CartItem from "@/components/ui/clickable-cart-item";
import { StoreItem } from "@/components/ui/store-item-card";

export default function Page() {
  const router = useRouter();

  // State for list of items in the cart
  const [list, setList] = useState<StoreItem[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [selectedList, setSelectedList] = useState<StoreItem[]>([]);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // Fetch cart items and availability on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/fetch-cart", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: { cart: StoreItem[] } = await res.json();
        setList(data.cart || []);

        // Fetch availability for each item
        const availabilityData: Record<string, boolean> = {};
        for (const item of data.cart) {
          const availabilityRes = await fetch(
            `http://localhost:8080/check-availability`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ itemId: item._id }),
            }
          );
          const availabilityResult = await availabilityRes.json();
          availabilityData[item._id] = availabilityResult.available;
        }
        setAvailability(availabilityData);
      } catch (error) {
        console.error("Failed to fetch cart items or availability:", error);
      }
    };

    fetchData();
  }, []);

  // Update cart whenever the list changes
  const updateCart = useCallback(async (updatedList: StoreItem[]) => {
    try {
      const res = await fetch("http://localhost:8080/update-whole-cart", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedList),
      });
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  }, []);

  useEffect(() => {
    if (list.length > 0) {
      updateCart(list);
    }
  }, [list, updateCart]);

  // Calculate total price of selected items
  const totalPrice = selectedList.reduce(
    (total, item) => total + parseFloat(item.price) * item.quantity,
    0
  );

  // Handle checkbox toggle
  const handleCheckboxChange = (index: number) => {
    const item = list[index];
    const isSelected = selectedList.some((selected) => selected._id === item._id);

    const updatedSelectedList = isSelected
      ? selectedList.filter((selected) => selected._id !== item._id)
      : [...selectedList, item];

    setSelectedList(updatedSelectedList);
  };

  // Handle quantity change
  const handleQuantityChange = (id: string, newQuantity: number) => {
    const updatedList = list.map((item) =>
      item._id === id ? { ...item, quantity: newQuantity } : item
    );

    setList(updatedList);

    // Update quantity in selectedList if the item is selected
    setSelectedList((prevSelected) =>
      prevSelected.map((selected) =>
        selected._id === id ? { ...selected, quantity: newQuantity } : selected
      )
    );
  };

  // Handle delete action
  const handleDelete = (item: StoreItem) => {
    const updatedList = list.filter((i) => i._id !== item._id);
    setList(updatedList);

    const updatedSelectedList = selectedList.filter((i) => i._id !== item._id);
    setSelectedList(updatedSelectedList);

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 1000);

    updateCart(updatedList);
  };

  // Handle checkout action
  const handleCheckout = async () => {
    if (selectedList.length === 0) {
      console.log("No items selected for checkout.");
      return;
    }
  
    try {
      // Send the checkout request to the backend
      const res = await fetch("http://localhost:8080/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedItems: selectedList,
          totalPrice,
        }),
      });
  
      if (!res.ok) {
        throw new Error(`Checkout failed: ${res.statusText}`);
      }
  
      const data = await res.json();
  
      // Clear the selected items from the cart in local state
      const updatedList = list.filter(
        (item) => !selectedList.some((selected) => selected._id === item._id)
      );
      setList(updatedList);
      setSelectedList([]);
  
      console.log("Checkout successful:", data.message);
      updateCart(updatedList);
    } catch (error) {
      console.error("Failed to complete checkout:", error);
    }
  };

  

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
                  <BreadcrumbPage>Cart</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="px-6">
          <div className="flex justify-end gap-3 items-center mb-4">
            <button
              onClick={() => router.push("/store")}
              className="flex items-center gap-3 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors"
            >
              <ShoppingBasket size={24} />
              <span>Store</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {showFeedback && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg">
              <Check className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Item removed</span>
            </div>
          </div>
        )}

        {/* Cart Items Section */}
        <div id="cart-items" className="flex-1 overflow-y-auto px-6">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-xl text-gray-500">Your cart is empty</p>
              <button
                onClick={() => router.push("/store")}
                className="flex items-center gap-2 bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors"
              >
                <ShoppingBasket size={20} />
                <span>Visit the store</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-2 pb-4">
              {list.map((item, index) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onDelete={() => handleDelete(item)}
                  onCheckboxChange={() => handleCheckboxChange(index)}
                  onQuantityChange={(id: string, newQuantity: number) =>
                    handleQuantityChange(id, newQuantity)
                  }
                  isAvailable={availability[item._id] ?? false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="sticky p-4 border-t border-gray-200 bg-white bottom-0">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg">Items selected: {selectedList.length}</p>
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