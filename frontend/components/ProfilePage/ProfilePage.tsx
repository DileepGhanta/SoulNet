'use client'

import { RootState } from '@/Store/store'
import { BASE_API_URL } from '@/server'
import { User } from '@/types'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { handleAuthRequest } from '../utils/apiRequest'
import { Bookmark, Grid, LoaderCircleIcon } from 'lucide-react'
import LeftSidebar from '../Home/LeftSidebar'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '../ui/sheet'
import { MenuIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Link from 'next/link'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import Post from './Post'
import Save from './Save'
import { useFollowUnfollow } from '../hooks/use-auth'




type Props ={
    id: string 
}



const ProfilePage = ({id}:Props) => {
    // console.log("COMPONENT", id);

    const {handleFollowUnfollow} = useFollowUnfollow()
    const router = useRouter()
    const user = useSelector((state:RootState)=>state.auth.user)
    const [postOrSave, setPostOrSave] = useState<string>("POST");

    const [isLoading,setIsLoading] = useState(false);
    const [userProfile,setUserProfile]= useState<User >();

    const isOwnProfile = user?._id === id //its our own profile
    const isFollowing = user?.following.includes(id)  //which means we are following the user 

    console.log("USER", userProfile)
    console.log(isOwnProfile,isOwnProfile)

    useEffect(()=>{

        if(!user){
            return router.push('/auth/login');
        }
        const getUser = async () => {
            const getUserReq = async () =>
              await axios.get(`${BASE_API_URL}/users/profile/${id}`)
      
            const result = await handleAuthRequest(getUserReq, setIsLoading)
      
            if (result) {
              setUserProfile(result.data.data.user)
            }
          } 
        getUser();
    },[user,router,id])

    if (isLoading) {
        return (
          <div className='w-full h-screen flex items-center justify-center flex-col'>
            <LoaderCircleIcon className='animate-spin w-10 h-10 text-blue-500' />
            <p className='text-gray-600 mt-2'>Loading Profile...</p>
          </div>
        );
      }

      return (
        <div className="flex bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white min-h-screen overflow-hidden">
          {/* LEFT SIDEBAR */}
          <div className="w-[20%] hidden md:block border-r border-gray-700 h-screen fixed bg-[#0f172a] shadow-xl">
            <LeftSidebar />
          </div>
      
          {/* MAIN CONTENT */}
          <div className="flex-1 md:ml-[20%] overflow-y-auto min-h-screen pb-10 flex flex-col justify-between">
            {/* MOBILE SIDEBAR */}
            <div className="md:hidden px-4 py-4">
              <Sheet>
                <SheetTrigger className="text-white">
                  <MenuIcon className="w-6 h-6" />
                </SheetTrigger>
                <SheetContent className="bg-[#0f172a] text-white">
                  <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
                  <SheetDescription className="text-sm text-gray-400">Navigate</SheetDescription>
                  <LeftSidebar />
                </SheetContent>
              </Sheet>
            </div>
      
            {/* PROFILE CONTAINER */}
            <div className="w-[90%] sm:w-[80%] mx-auto">
              {/* TOP PROFILE */}
              <div className="mt-20 md:mt-16 flex md:flex-row flex-col md:items-center pb-8 border-b border-gray-700 md:space-x-20 relative z-10">
                <Avatar className="w-[10rem] h-[10rem] mb-8 md:mb-0 cursor-pointer shadow-lg ring-4 ring-rose-100/30">
                  <AvatarImage
                    src={userProfile?.profilePicture}
                    className="h-full w-full rounded-full object-cover"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
      
                <div className="text-center md:text-left w-full">
                    {/* Username + Edit Button in one row */}
                    <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-wide">
                        {userProfile?.username}
                        </h1>
                        {isOwnProfile && (
                        <Link href="/edit-profile">
                            <Button 
                                variant="secondary" 
                                className="text-sm px-6 py-3 rounded-lg border border-transparent bg-gradient-to-r
                                cursor-pointer from-blue-500 to-indigo-600 text-white hover:bg-gradient-to-l hover:to-blue-500 transition-all duration-300 shadow-md">
                                Edit Profile
                            </Button>
                        </Link>
                        )}
                        {!isOwnProfile && (
                        <Button  onClick={() => handleFollowUnfollow(id)} variant={isFollowing ? "destructive" : "secondary"} 
                        className={`text-lg px-8 py-4 rounded-lg font-semibold border border-transparent ${
                            isFollowing 
                                ? "bg-red-400 text-white hover:bg-red-500" // Soft red for Unfollow
                                : "bg-blue-400 text-white hover:bg-blue-500" // Subtle blue for Follow
                            } transition-all duration-300 transform hover:scale-105 shadow-md`}>
                            {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                    )}
                    </div>
 
                    <div className='flex items-center space-x-8 mt-6 mb-6'>
                        <div >
                            <span className='font-bold'>{userProfile?.posts.length}</span>
                            <span>   Posts</span>
                        </div>
                        <div>
                            <span className='font-bold'>{userProfile?.followers.length}</span>
                            <span>   Followers</span>
                        </div>
                        <div>
                            <span className='font-bold'>{userProfile?.following.length}</span>
                            <span>   Following</span>
                        </div>
                    </div>
                    <p className='w-[80%] font-medium'>{userProfile?.bio}</p>
             </div>
      
          </div>
          {/* BOTTOM POST AND SAVE :-) */}
          <div className='mt-10'>
            <div className='flex items-center justify-center space-x-14'>
                <div className={cn("flex items-center space-x-2 cursor-pointer", postOrSave ==="POST" &&
                "text-blue-500")}
                onClick={()=>setPostOrSave("POST")}
                >
                    <Grid/>
                    <span className='font-semibold'>Post</span>
                </div>
                <div className={cn("flex items-center space-x-2 cursor-pointer", postOrSave ==="SAVE" &&
                "text-blue-500")}
                onClick={()=>setPostOrSave("SAVE")}
                >
                    <Bookmark/>
                    <span className='font-semibold'>Saved</span>
                </div> 
            </div>
            {postOrSave === "POST" && <Post userProfile={userProfile} />}
            {postOrSave === "SAVE" && <Save userProfile={userProfile} />}
          </div>
        </div>
        </div>
        </div>
      )
    }      
    
    export default ProfilePage


































































    {/* 🌙 ROYAL FOOTER
    <footer className="text-center text-gray-500 text-sm py-6 border-t border-gray-700 mt-10">
      © {new Date().getFullYear()} SoulNet — Crafted with ❤️ by Ajay Kumar Grandhisila
    </footer> */}