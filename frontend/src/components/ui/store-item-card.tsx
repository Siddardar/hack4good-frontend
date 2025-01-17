import React from "react";
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import { ShoppingCart, AlarmClockPlus } from "lucide-react";

export type StoreItem = {
  _id: string;
  name: string;
  price: string;
  img: string;
  quantity: number;
  dateAdded: string;
};

type StoreItemCardProps = {
  item: StoreItem;
  onAddToCart: (e: any, item: StoreItem) => void;
  onRequest: (item: StoreItem) => void;
  onCardClick: (item: StoreItem) => void;
};

export const StoreItemCard: React.FC<StoreItemCardProps> = ({
  item,
  onAddToCart,
  onRequest,
  onCardClick,
}) => {
  return (
    <Card
      shadow="sm"
      onPress={() => onCardClick(item)}
      className="cursor-pointer"
    >
      {/* Image */}
      <CardBody className="overflow-visible p-0">
        <Image
          alt={item.name}
          src={item.img}
          className={`w-full object-cover h-[160px] ${
            item.quantity === 0 ? "grayscale" : ""
          }`}
          radius="lg"
          width="100%"
        />
      </CardBody>

      {/* Footer */}
      <CardFooter className="text-small flex justify-between items-center">
        {/* Item Details */}
        <div className="flex flex-col">
          <b>{item.name}</b>
          <p className="text-default-500">${parseFloat(item.price).toFixed(2)}</p>
        </div>

        {/* Add to cart or Preorder Button */}
        {item.quantity > 0 ? (
          <button
            className="flex items-center cursor-pointer mr-2"
            onClick={(e) => onAddToCart(e, item)}
          >
            <ShoppingCart size={24} color="gray" />
          </button>
        ) : (
          <button
            className="flex items-center cursor-pointer mr-2"
            onClick={() => onRequest(item)}
          >
            <AlarmClockPlus size={24} color="gray" />
          </button>
        )}
      </CardFooter>
    </Card>
  );
};
