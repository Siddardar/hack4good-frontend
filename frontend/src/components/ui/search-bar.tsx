import React from "react";
import { Search } from "lucide-react";

export const SearchBar = ({ searchQuery, setSearchQuery, placeholder = "Search for items..." }) => {
  return (
    <div className="px-4 pb-4">
      {/* Search bar with icon on the left */}
      <div className="flex border border-gray-300 rounded-3xl">
        <button className="ml-2 p-3 flex items-center justify-center">
          <Search size={20} color="gray" />
        </button>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
};
