'use client'

import { Loader, Loader2, Loader2Icon, LoaderPinwheelIcon, MailCheck } from 'lucide-react'
import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import LoadingButton from '../Helper/LoadingButton'
import { BASE_API_URL } from '@/server'
import axios from 'axios'
import { handleAuthRequest } from '../utils/apiRequest'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { setAuthUser } from '@/Store/authSlice'
import { toast } from 'sonner'
import { RootState } from '@/Store/store'

const Verify = () => {

    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector((state:RootState) => state?.auth.user); 
    //it is used to fetch the logged in user from the redux store   
    const [isPageLoading,setIsPageLoading] = useState(true);


    useEffect(()=>{   //if a user doesnt have an account and try to access the page we will stop them
        if(!user){
            router.replace("/auth/login");
        }
        else if(user && user.isVerified){
            router.replace("/");
        }
        else{
            setIsPageLoading(false)
        }
    },[user,router]);


    const [isLoading,setIsLoading] = useState(false);
    const [otp,setOtp] = useState<string[]>(["","","","","",""]) // array of empty otp's initially

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    console.log(otp)


    //this handler is responsible for moving to next box automatically when we enter the otp 
    const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>): void => {
        const { value } = event.target;
      
        if (/^\d*$/.test(value) && value.length <= 1) {
          const newOtp = [...otp];
          newOtp[index] = value;
          setOtp(newOtp);
        }
      
        if (value.length === 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
      };

      const handleKeyDown=(
        index:number,
        event:KeyboardEvent <HTMLInputElement>
      ):void=>{
        if(event.key === "Backspace" && !inputRefs.current[index]?.value && inputRefs.current[index-1]){
            inputRefs.current[index-1]?.focus();
        }

    }

    const handleSubmit = async()=>{
        const otpValue = otp.join("")
        const verifyReq = async()=> await axios.post(`${BASE_API_URL}/users/verify`,{otp:otpValue},{withCredentials:true})

        const result = await handleAuthRequest(verifyReq,setIsLoading);

        if(result){
            dispatch(setAuthUser(result.data.data.user))
            toast.success(result.data.message);
            router.push("/");
        }
    }


    const handleResendOtp = async()=>{
        const resendOtReq = async()=> await axios.post(`${BASE_API_URL}/users/resend-otp`,null,{
            withCredentials:true,
        })

        const result = await handleAuthRequest(resendOtReq,setIsLoading);

        if(result){
            toast.success(result.data.message);

        }
    }

    if(isPageLoading){
        return(
            <div className='h-screen flex justify-center items-center'>
                <Loader2Icon className='w-20 h-20 animate-spin'/>
            </div>
        )
    }







  return (
    <div className='h-screen flex items-center flex-col justify-center'>
        <MailCheck 
        className="w-20 h-20 sm:w-32 text-red-600 mb-8 cursor-pointer transition-all duration-300 hover:text-red-600 hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        />
        <h1 className='text-2xl sm:text-3xl font-bold mb-3'>OTP Verification</h1>
        <p className=' text-sm sm:text-base text-gray-600 font-medium'>We have sent a code to {user?.email}</p>
        <p className='mb-6 text-sm sm:text-base text-gray-600 font-medium'>Can’t find it? Be sure to check your spam folder 😇😇</p>
        <div className='flex space-x-4'>
            {[0,1,2,3,4,5].map((index)=>{
                return (
                    <input type='text' key={index} maxLength= {1} className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 
                    text-center text-2xl sm:text-3xl md:text-4xl font-extrabold 
                    text-red-600 dark:text-white 
                    bg-white/30 dark:bg-white/10 backdrop-blur-md 
                    border border-gray-300 dark:border-gray-600 
                    shadow-[inset_4px_4px_10px_rgba(255,255,255,0.3),_4px_4px_15px_rgba(0,0,0,0.2)]
                    rounded-2xl 
                    outline-none transition-all duration-200
                    focus:ring-2 focus:ring-offset-2 focus:ring-red-400 focus:border-red-500
                    hover:scale-105 focus:scale-110"
                    value={otp[index] || ""}
                    ref={(el)=>{inputRefs.current[index]=el;
                    }}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onChange={(e)=>handleChange(index,e)}
                    />
                )
            })}
        </div>
        <div className='flex items-center mt-4 space-x-2'>
            <h1 className='text-sm sm:text-lg font-medium text-gray-700'>Didn't get the otp code ?</h1>  
            <button className="text-blue-800 hover:text-blue-600 underline font-semibold cursor-pointer"
            onClick={handleResendOtp}>Resend Code</button>
        </div>
        <LoadingButton 
        isLoading={isLoading}
         size={"lg"}
         className="w-30 sm:w-48 mt-4 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-bold 
         py-3 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg shadow-red-400/40"
          onClick={handleSubmit}
        >
            Verify 
        </LoadingButton>
    </div>
  )
}

export default Verify