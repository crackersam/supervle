"use client";

import React from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useSession } from "next-auth/react";
import { AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Image from "next/image";
import Logo from "@/public/supervle-logo.png";

const Header = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  return (
    <div className="max-w-7xl mx-auto flex justify-between items-center py-2">
      <Image
        src={Logo}
        alt="Logo"
        width={150}
        height={50}
        className="h-[50px] w-[200px] -mx-10 mt-5 object-cover"
      />
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <p className="text-md font-semibold text-right text-gray-800">
            {session?.user?.forename} {session?.user?.surname}
          </p>
          <p className="text-sm text-gray-600 text-right">
            {session?.user?.role
              ? session.user.role[0].toUpperCase() +
                session.user.role.slice(1).toLowerCase()
              : "Unknown Role"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer border border-gray-300 bg-white shadow-sm h-[50px] w-[50px]">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="flex items-center justify-center w-full">
                {session?.user?.forename ? session.user.forename[0] : "?"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Messages</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
