import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import MenuItems from "./menu-items";

const Menu = () => {
  return (
    <>
      <Sheet>
        <SheetTrigger className="md:hidden">
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 md:hidden">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <MenuItems />
        </SheetContent>
      </Sheet>
      <div className="flex-col gap-2 p-4 hidden md:flex">
        <MenuItems />
      </div>
    </>
  );
};

export default Menu;
