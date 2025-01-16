import React from 'react';
import ScrollToTop from "react-scroll-up";
import { ChevronUp } from 'lucide-react';

export default function ScrollToTopButton() {
    return (
        <div className="relative z-[300]">
            <ScrollToTop>
                <p className="font-bold text-black cursor-pointer rounded-full p-3">
                    <ChevronUp />
                </p>
            </ScrollToTop>
        </div>
    );
}
