import React from 'react'
import { Bell} from 'lucide-react'

export default function Header() {
  return (
    <div className="w-full bg-gradient-to-r from-black to-blue-950 rounded-xl p-4 d-flex justify-between items-center">
        <div>
        <h4 className="text-white font-semibold p-0 m-0">
      Seamless Data Migration: Simplified and Secure
    </h4>
    <p className="text-gray-300 p-0 m-0 font-light mt-1">
      Migrate your data effortlessly and securely, ensuring a smooth transition for your business.
    </p>
        </div>
        <div className='d-flex gap-[10px] text-white items-center'>

        <Bell />
        <span>
            <p>Xerago</p>
            <p className='opacity-80'>Admin</p>
        </span>
        </div>
   
  </div>
  )
}
