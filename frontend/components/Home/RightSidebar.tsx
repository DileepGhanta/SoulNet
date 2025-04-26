'use client'

import { RootState } from '@/Store/store'
import { BASE_API_URL } from '@/server'
import { User } from '@/types'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { handleAuthRequest } from '../utils/apiRequest'
import { Loader } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const RightSidebar = () => {

    const user = useSelector((state:RootState)=>state.auth.user)
    const  [suggestedUser , setSuggestedUser] = useState<User[]>([]);
    const [isLoading,setIsLoading] = useState(false)
    const router = useRouter();

    console.log("Suggested user",suggestedUser);

    useEffect(()=>{
        const getSuggestedUser = async() =>{
            const getSuggestedUserReq = async()=> await axios.get(`${BASE_API_URL}/users/suggested-user`,{
                withCredentials:true,
            });
            const result = await handleAuthRequest(getSuggestedUserReq,setIsLoading);

            if(result) setSuggestedUser(result.data.data.users)
        };
        getSuggestedUser();
    },[]);

    if(isLoading){
        return(
            <div className='w-full h-screen flex items-center justify-center flex-col'>
                <Loader className='animate-spin'/>
            </div>
        )
    }


  return (
    <div>
        <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
                <Avatar className='w-11 h-11 ring-2 ring-rose-500 cursor-pointer'>
                    <AvatarImage src={user?.profilePicture} className='h-full w-full rounded-full' />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className='font-bold'>{user?.username}</h1>
                    <p className='text-[13px] text-gray-500'>{user?.bio || "Hey! I am using SoulNet"}</p>
                </div>
            </div>
            <h1 className='mt-2 ttext-sm px-4 py-1.5 rounded-full cursor-pointer bg-rose-100 hover:bg-red-300 transition text-red-800 hover:text-red-600 block text-md text-right font-semibold'>Switch</h1>
        </div>
        <div className=' flex items-center justify-between mt-14'>
            <h1 className='font-semibold text-gray-700'>Suggested User</h1>
            <h1 className='font-medium  cursor-pointer'>See all</h1>
        </div>

        {suggestedUser?.slice(0, 7).map((s_user) => {
            return (
                <div
                onClick={()=>router.push(`/profile/${s_user._id}`)}
                key={s_user._id}
                className='mt-6 bg-white shadow-md rounded-2xl px-4 py-3 hover:shadow-lg transition-shadow duration-300'>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                    <Avatar className='w-11 h-11 ring-2 ring-blue-700 cursor-pointer'>
                        <AvatarImage
                        src={s_user?.profilePicture}
                        className='h-full w-full rounded-full object-cover'
                        />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className='font-semibold text-[15px] text-gray-800'>{s_user.username}</h1>
                        <p className='text-[13px] text-gray-500'>
                        {s_user.bio || "Hey! I am using SoulNet"}
                        </p>
                    </div>
                    </div>
                    <button className="text-sm px-4 py-1.5 rounded-full cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-300 transition">
                    View
                    </button>
                </div>
                </div>
            );
            })}


    </div>
  )
}

export default RightSidebar