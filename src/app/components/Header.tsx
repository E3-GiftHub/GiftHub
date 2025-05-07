"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <div className="w-[100%] mx-auto"> 
      <header className="flex items-center justify-between px-6 py-4 bg-[#1e1b4b] text-white shadow-md rounded-lg">
        <div className="flex items-center space-x-4">
          <img src="/logo.png" alt="Gift Hub Logo" className="h-18 w-auto" />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 px-4 py-2 border border-white rounded-full hover:bg-white hover:text-[#1e1b4b] transition"
          >
            Home
          </button>
          <button
            onClick={() => router.push("/inbox")}
            className="flex items-center space-x-2 px-4 py-2 border border-white rounded-full hover:bg-white hover:text-[#1e1b4b] transition"
          >
            Inbox
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center space-x-2 px-4 py-2 border border-white rounded-full hover:bg-white hover:text-[#1e1b4b] transition"
          >
            Profile
          </button>
        </div>
      </header>
    </div>
  );
}