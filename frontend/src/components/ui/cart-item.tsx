import React, { useState } from 'react';
import { useSwipeable } from "react-swipeable";
import { Trash2 } from 'lucide-react';

const CartItem = ({ item, index, onDelete, onCheckboxChange }) => {
  const [offset, setOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (data) => {
      if (data.dir === 'Left') {
        const newOffset = Math.max(-100, data.deltaX);
        setOffset(newOffset);
      }
    },
    onSwipedLeft: () => {
      if (offset < -50) {
        setIsDeleting(true);
        setTimeout(() => {
          onDelete(item);
        }, 200);
      } else {
        setOffset(0);
      }
    },
    onSwipedRight: () => {
      setOffset(0);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div
      className={`transform transition-all duration-200 ${isDeleting ? 'opacity-0 scale-95' : ''}`}
      style={{ touchAction: 'pan-y' }}
    >
      <div
        {...handlers}
        className="relative overflow-hidden"
      >
        {/* Delete indicator background */}
        <div className="absolute inset-1 bg-red-500 flex items-center justify-end px-4 rounded-lg">          
            <Trash2 className="text-white" size={24} />
        </div>
        
        {/* Main content */}
        <div
          style={{
            transform: `translateX(${offset}px)`,
            transition: offset === 0 ? 'transform 0.2s ease-out' : 'none'
          }}
          className={`p-4 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow ${
            item.isAvailable ? "" : "grayscale"
          }`}
        >
          <div className="flex items-center gap-4">
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

            <div className="flex flex-col flex-1 line-clamp-2">
              <b className="text-lg truncate">{item.title}</b>
              <p className="text-gray-500 text-sm overflow-hidden text-ellipsis line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 min-w-[100px] shrink-0">
              <p className="text-lg font-semibold">{item.price}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
