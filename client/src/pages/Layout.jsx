import React, { useState } from "react";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Loading from "../components/Loading";
import { useSelector } from "react-redux";

const Layout = () => {
  const user = useSelector((state) => state.user.value);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Loading />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: only ONE instance */}
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between p-4 bg-white sm:hidden sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="LinkUp"
              className="w-30 h-11 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          {sidebarOpen ? (
            <X
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 w-12 h-12 text-gray-700 transition-colors"
              aria-label="Close menu"
            />
          ) : (
            <Menu
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-10 h-10 text-white shadow-lg transition-all"
              aria-label="Open menu"
            />
          )}
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
