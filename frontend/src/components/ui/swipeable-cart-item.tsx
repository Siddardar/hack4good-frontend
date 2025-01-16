import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const CartItem = ({ item, index, onDelete, onCheckboxChange }) => {
  return (
    <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className={`flex items-center gap-4 ${item.isAvailable ? "" : "grayscale"}`}>
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

        <img
          src={item.img}
          alt={item.title}
          className="w-20 h-20 object-cover rounded-lg"
        />

        <div className="flex flex-col flex-1">
          <b className="text-lg truncate">{item.title}</b>
          <p className="text-gray-500 text-sm overflow-hidden text-ellipsis line-clamp-2">
            {item.description}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 min-w-[100px] shrink-0">
          <p className="text-lg font-semibold">{item.price}</p>
          <button
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md flex items-center gap-1 hover:bg-red-600 transition-colors"
            onClick={() => onDelete(item)}
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
