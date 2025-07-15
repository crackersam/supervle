// Separate Client Component for interactive/responsive parts
"use client";

import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MenuItems from "@/components/menu-items";

function LoggedInLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-200">
      {/* Mobile Menu Toggle with Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white shadow-md text-gray-800"
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 p-4 bg-white border-r border-gray-200"
        >
          <SheetHeader className="hidden">
            <SheetTitle className="text-lg font-semibold text-gray-900">
              Menu
            </SheetTitle>
          </SheetHeader>
          <MenuItems />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200 h-full p-4 overflow-auto shadow-lg text-gray-800">
        <MenuItems />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-auto">{children}</main>
    </div>
  );
}

export default LoggedInLayoutClient;
