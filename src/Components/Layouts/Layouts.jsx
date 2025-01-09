import React, { useState } from "react";
import Header from "../Header/Header";
import Dashboard from "../Dashboard/Dashboard";
import { Database } from "lucide-react";
import bgImage from "../../assets/Images/bg1.png";
export default function Layouts() {
    const [isShowDB, setIsShowDB] = useState(true)

  const toggleIsShowDB = () => {
    setIsShowDB((prev) => !prev); // Toggle the state
  };
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-[360px] bg-[#FFFFFF] p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#292C89]">Xcelerate CRM</h1>
        </div>

        <nav className="space-y-4">
          <a
            // href="#"
            className={`flex items-center space-x-3 no-underline rounded-full p-2 border   bg-[#292C89] 
${isShowDB ? 'text-white bg-[#292C89] border-none' : 'bg-white border-[#292C89] text-[#292C89] ring-[#292C89] ring-2'}`}
             onClick={() => toggleIsShowDB()}
          >
            <Database className="h-5 w-5" />
            <span>Migrate data</span>
          </a>
        </nav>
      </div>

      <div
        className="d-flex flex-column min-vh-100 w-100 overflow-auto"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "left",
          backgroundRepeat: "no-repeat",
          width: "100%",
          height: "100vh",
          padding: "2% 4%",
          
        }}
      >
        <Header />
        {
        isShowDB && 
        <Dashboard />
        }
      </div>
    </div>
  );
}
