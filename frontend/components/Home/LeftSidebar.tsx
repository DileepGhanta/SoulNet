'use client'

import { Heart, Home, LogOutIcon, MessageCircle, Search, SquarePlusIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/Store/store'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import axios from 'axios'
import { BASE_API_URL } from '@/server'
import { setAuthUser } from '@/Store/authSlice'
import { toast } from 'sonner'
import CreatePostModel from './CreatePostModel'

const LeftSidebar = () => {
  
    const user = useSelector((state:RootState) =>state.auth.user)
    const router = useRouter();
    const dispatch = useDispatch();

    const [isDialogOpen , setIsDialogOpen] = useState(false);


    
    const SidebarLinks = [
        {
            icon: <Home/>,
            label: "Home"
        },
        {
            icon:<Search/>,
            label:"Search"
        },
        {
            icon:<MessageCircle/>,
            label:"Message"
        },
        {
            icon:<Heart/>,
            label:"Notification"
        },
        {
            icon:<SquarePlusIcon/>,
            label:"Create"
        },
        {
            icon:(
                <Avatar className='w-9 h-9'>
                    <AvatarImage src = {user?.profilePicture} className='h-full w-full '/>
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            label:"Profile"
        },
        {
            icon:<LogOutIcon/>,
            label:"Logout"
        },
        

    ]
    const handleLogout = async () => {
      try {
          await axios.post(`${BASE_API_URL}/users/logout`, {}, {
              withCredentials: true
          });
  
          dispatch(setAuthUser(null));
          toast.success("Logout Successfully");
          router.push("/auth/login");
      } catch (error) {
          console.error('Error during logout:', error);  // Log the full error to debug
          toast.error("Logout failed! Please try again.");
      }
  };





    const handleSidebar = (label:string)=>{
        if(label==='Home') router.push("/");
        if(label === 'Logout') handleLogout()
        if(label === 'Profile') router.push(`/profile/${user?._id}`);
        if(label === 'Create') setIsDialogOpen(true); 

    }


    return (
        <div className="h-full bg-gradient-to-b from-[#f5f7fa] to-[#e4ecf5] border-r border-gray-200 shadow-xl">
          <CreatePostModel isOpen= {isDialogOpen} onClose={()=>setIsDialogOpen(false)}/>
          <div className="lg:p-6 p-3">
          <div onClick={() => { router.push("/") }} className="lg:p-6 p-3 cursor-pointer">
              <Image 
                src="/images/logo.png" 
                alt="logo" 
                priority
                width={150} 
                height={150}
                className="mt-[-2rem] hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-6 space-y-2">
              {SidebarLinks.map((link) => (
                <div
                  key={link.label}
                  className="flex items-center gap-3 p-3 rounded-xl group cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-sm"
                  onClick={()=>handleSidebar(link.label)}
                >
                  <div className="group-hover:scale-110 transition-transform duration-200 text-[#6366f1]">
                    {link.icon}
                  </div>
                  <p className="lg:text-lg text-base font-medium text-gray-800 group-hover:text-black">
                    {link.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
      
      

export default LeftSidebar