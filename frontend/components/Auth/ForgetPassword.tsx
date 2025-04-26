'use client'

import { KeySquareIcon } from 'lucide-react'
import React, { useState } from 'react'
import LoadingButton from '../Helper/LoadingButton'
import axios from 'axios'
import { BASE_API_URL } from '@/server'
import { handleAuthRequest } from '../utils/apiRequest'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const ForgetPassword = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [email,setEmail] = useState("");
    const router = useRouter()

    const handleSubmit = async()=>{
        const forgetPassReq = async() => await axios.post(`${BASE_API_URL}/users/forget-password`,{email},
        {withCredentials:true});

        // if(!email){
        //     toast.message("Enter email")
        // }
        const result = await handleAuthRequest(forgetPassReq,setIsLoading);

        if(result){
            console.log(result.data)
            toast.success(result.data.message)
            router.push (`/auth/reset-password?email=${encodeURIComponent(email)}`)
        }
    }


    return(
        <div className='flex items-center justify-center flex-col w-full h-screen'>
            <KeySquareIcon className="w-20 h-20 sm:w-32 text-red-600 mb-8 cursor-pointer transition-all duration-300 hover:text-red-600 hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"/>
            <h1 className='text-2xl sm:text-3xl font-bold mb-3'>Forget Your Password?</h1>
            <p className='mb-6 text-sm sm:text-base text-center text-gray-600 font-medium'>Enter your email and we will help you to reset your password</p>
            <input type = "email" placeholder='Enter your email'
            onChange={(e)=>setEmail(e.target.value)}
             className='px-6 py-3.5 rounded-lg outline-none bg-gray-200 block
            w-[90%] sm:w-[80%] md:w-[60%] lg-w-[40%] xl-w-[30%] mx-auto' value={email}/>
            <LoadingButton className="w-30 sm:w-48 mt-7 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-bold 
         py-3 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg shadow-red-400/40" 
         isLoading={isLoading}
         onClick={handleSubmit}>
                Continue
            </LoadingButton>

        </div>
    )
}

export default ForgetPassword