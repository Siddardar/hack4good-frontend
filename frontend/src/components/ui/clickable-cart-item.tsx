

import React from "react";
import { Trash2, Minus, Plus } from "lucide-react";

// Define the type for a cart item
type CartItemProps = {
  item: {
    _id: string;
    img: string;
    name: string;
    price: string;
    desc?: string;
    quantity: number;
  };
  
  onDelete: (id: string) => void;
  onCheckboxChange: (id: string) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
  isAvailable: boolean; 
};

const CartItem: React.FC<CartItemProps> = ({
  item,
  onDelete,
  onCheckboxChange,
  onQuantityChange,
  isAvailable,
}) => {
  // Handle decrease quantity
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item._id, item.quantity - 1);
    }
  };

  // Handle increase quantity
  const handleIncrease = () => {
    onQuantityChange(item._id, item.quantity + 1);
  };

  const available = isAvailable; 

  return (
    <div className="p-3 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div className="h-3 w-3">
          {available ? (
            <input
              type="checkbox"
              className="h-4 w-4 rounded-full cursor-pointer accent-zinc-800"
              onChange={() => onCheckboxChange(item._id)}
            />
          ) : (
            <div className="w-5 h-5"></div>
          )}
        </div>

        {/* Image */}
        <img
          src={item.img}
          alt={item.name}
          className={`w-16 h-16 mr-auto object-cover rounded-lg ${
            available ? "" : "grayscale"
          }`}
        />

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <b className="text-md truncate w-full">{item.name}</b>
          <p className="text-sm">${item.price}</p>
          <p className="text-gray-500 text-xs overflow-hidden text-ellipsis line-clamp-2">
            {item.desc}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 items-center justify-center min-w-[100px] shrink-0">
          {/* Trash Icon */}
          <button
            className="text-zinc-800 rounded-md flex items-center"
            onClick={() => onDelete(item._id)}
          >
            <Trash2 size={18} />
          </button>

          {/* Quantity */}
          {available ? (
            <div className="flex items-center gap-1">
              <button
                className="text-gray-700 border rounded-md w-6 h-6 flex items-center justify-center text-sm"
                onClick={handleDecrease}
                disabled={item.quantity <= 1}
              >
                <Minus size={12} />
              </button>
              <span className="text-sm font-medium w-4 text-center">
                {item.quantity}
              </span>
              <button
                className="text-gray-700 border rounded-md w-6 h-6 flex items-center justify-center text-sm"
                onClick={handleIncrease}
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-700 text-center">Unavailable</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;