import React, { useState } from "react";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Loading from "../components/Loading";
import { dummyUserData } from "../assets/assets";

const Layout = () => {
  const user = dummyUserData;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Loading />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          sm:relative sm:translate-x-0 sm:shadow-none
        `}
      >
        <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar (for mobile menu toggle) */}
        <div className="flex items-center justify-between p-3 bg-white shadow sm:hidden">
          <h1 className="text-lg font-semibold text-gray-800">LinkUp</h1>
          {sidebarOpen ? (
            <X
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 w-10 h-10 text-gray-600"
            />
          ) : (
            <Menu
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 w-10 h-10 text-gray-600"
            />
          )}
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
