import React from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut } from "lucide-react";
import { UserButton, useClerk } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const SideBar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.value);
  const { signOut } = useClerk();

  const handleSignOut = () => {
    // Close sidebar on mobile, then sign out
    if (sidebarOpen) setSidebarOpen(false);
    signOut();
  };

  return (
    <div
      className={`
        flex h-full flex-col justify-between bg-white border-r border-gray-200
        w-60 xl:w-72
        max-sm:fixed max-sm:inset-y-0 max-sm:left-0 max-sm:z-50
        max-sm:transition-transform max-sm:duration-300 max-sm:ease-in-out
        ${sidebarOpen ? "max-sm:translate-x-0" : "max-sm:-translate-x-full"}
        sm:static sm:translate-x-0
      `}
    >
      <div className="w-full">
        <img
          onClick={() => {
            navigate("/");
            setSidebarOpen(false);
          }}
          src="/logo.png"
          alt="logo"
          className="w-26 h-11 sm:w-28 ml-7 my-2 cursor-pointer"
        />
        <hr className="border-gray-300 mb-8" />

        <MenuItems setSidebarOpen={setSidebarOpen} />

        <Link
          to="/create-post"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer"
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          {/* UserButton is a full popover; it stays clickable on mobile when sidebar is actually on top */}
          <UserButton />
          <div>
            <h1 className="tex-sm font-medium">
              {user?.full_name || "Guest"}
            </h1>
            <p className="text-xs text-gray-500">
              @{user?.username || "username"}
            </p>
          </div>
        </div>
        {/* Wrap icon in button to ensure reliable clicks */}
        <button
          type="button"
          onClick={handleSignOut}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <LogOut className="w-4 h-4 text-gray-400 hover:text-gray-700 transition" />
        </button>
      </div>
    </div>
  );
};

export default SideBar;
