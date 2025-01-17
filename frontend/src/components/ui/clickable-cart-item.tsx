import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';

const CartItem = ({ item, index, onDelete, onCheckboxChange, onQuantityChange }) => {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(index, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(index, item.quantity + 1);
  };

  return (
    <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div className="h-5 w-5">
          {item.isAvailable ? (
            <input
              type="checkbox"
              className="h-5 w-5 rounded-full cursor-pointer accent-zinc-800"
              checked={item.isSelected}
              onChange={() => onCheckboxChange(index)}
            />
          ) : (
            <div className="w-5 h-5"></div>
          )}
        </div>

        {/* Image */}
        <img
          src={item.img}
          alt={item.title}
          className={`w-20 h-20 object-cover rounded-lg ${item.isAvailable ? "" : "grayscale"}`}
        />

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <b className="text-md truncate">{item.title}</b>
          <p className="text-md">${item.price.toFixed(2)}</p>
          <p className="text-gray-500 text-xs overflow-hidden text-ellipsis line-clamp-2">
            {item.description}
          </p>
        </div>

        <div className="flex flex-col gap-2 items-center justify-between min-w-[100px] shrink-0">
          <button
            className="text-gray rounded-md flex items-center mb-2"
            onClick={() => onDelete(item)}
          >
            <Trash2 size={20} />
          </button>

          {/* Quantity */}
          {item.isAvailable ? (
            <div className="flex items-center gap-1">
              <button
                className="text-gray-700 border rounded-md w-7 h-7 flex items-center justify-center"
                onClick={handleDecrease}
                disabled={item.quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="text-md font-medium w-2 text-center">{item.quantity}</span>
              <button
                className="text-gray-700 border rounded-md w-7 h-7 flex items-center justify-center"
                onClick={handleIncrease}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-700">Unavailable</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
