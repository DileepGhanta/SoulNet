'use client'

import { RootState } from '@/Store/store';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MenuIcon } from 'lucide-react';
import LeftSidebar from '@/components/Home/LeftSidebar';
import { AxiosError } from "axios";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingButton from '@/components/Helper/LoadingButton';
import PasswordInp from '@/components/Auth/PasswordInp';
import axios from 'axios';
import { BASE_API_URL } from '@/server';
import { handleAuthRequest } from '@/components/utils/apiRequest';
import { setAuthUser } from '@/Store/authSlice';
import { toast } from 'sonner';

const EditProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedImage, setSelectedImage] = useState<string | null>(user?.profilePicture || null);
  const [bio, setBio] = useState(user?.bio || "");
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleAvatarClick = () => {
    if(fileInputRef.current) fileInputRef.current.click()
  };

  const handleFileChnage = (event: React.ChangeEvent<HTMLInputElement>) => {
    // logic goes here if needed
    const file = event.target.files?.[0];
    if(file){
        const reader = new FileReader();
        reader.onload=()=> setSelectedImage(reader.result as string)
        reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
        // console.log(bio)
        const formData = new FormData()
        formData.append("bio",bio)

        if (fileInputRef.current && fileInputRef.current.files?.[0]) {    //if we have an image we will append the image also
            formData.append("profilePicture", fileInputRef.current.files[0]);
        }

        const updateProfileReq = async() => await axios.post(`${BASE_API_URL}/users/edit-profile`,formData,{
            withCredentials:true,
        })

        const result = await handleAuthRequest(updateProfileReq,setIsLoading);

        if(result){
            dispatch(setAuthUser(result.data.data.user))   //modifying with our edited user
            toast.success(result.data.message)

        }
  };


  const handlePasswordChange = async (e: React.FormEvent) => {
  e.preventDefault();

  // Check if the password fields are filled out
  if (!newPassword || !newPasswordConfirm) {
    toast.error("Please provide a new password and confirm it!");
    return;
  }

  // Check if passwords match
  if (newPassword !== newPasswordConfirm) {
    toast.error("Passwords do not match!");
    return;
  }

  const data = {
    currentPassword,
    newPassword,
    newPasswordConfirm,
  };

  try {
    // Send password change request
    const result = await axios.post(`${BASE_API_URL}/users/change-password`, data, {
      withCredentials: true,
    });

    // Handle success response
    toast.success(result.data.message || "Password changed successfully!");
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Handle specific errors from the backend
      const errorMessage = error.response?.data.message || "Something went wrong!";
      toast.error(errorMessage);
    } else {
      // Handle other types of errors (e.g., network issues)
      toast.error("An unexpected error occurred.");
    }
  }
};



  return (
    <div className='flex bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white min-h-screen'>
      <div className='w-[20%] hidden md:block border-r border-gray-700 h-screen fixed bg-[#1a1a2e]'>
        <LeftSidebar />
      </div>
      <div className='flex-1 md:ml-[20%] overflow-y-auto'>
        <div className='md:hidden'>
          <Sheet>
            <SheetTrigger>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent className="bg-[#1a1a2e] text-white border-gray-700">
              <SheetTitle></SheetTitle>
              <SheetDescription></SheetDescription>
              <LeftSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div className='w-[80%] sm:w-[80%] lg:w-[70%] mx-auto pt-20'>
        <div className='pb-16 border-b border-gray-600'>
                <div onClick={handleAvatarClick} className='flex items-center justify-center cursor-pointer'>
                <Avatar className='w-[10rem] h-[10rem] rounded-full shadow-xl'>
                        <AvatarImage src={selectedImage || ""} className='rounded-full object-cover' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>

                <input 
                type="file" 
                accept='/image/*' 
                className='hidden' 
                ref={fileInputRef} 
                onChange={handleFileChnage } 
                />
                <div className='flex items-center justify-center'>
                    <LoadingButton isLoading={isLoading} size={"lg"}
                                     className="mt-6 cursor-pointer bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold px-6 py-2 rounded-xl shadow-lg hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300"
                     onClick={handleUpdateProfile}
                     >
                        Change Photo
                    </LoadingButton>
                </div>
            </div>
            <div className='mt-10 border-b-2 pb-10'>
                <label htmlFor="bio" className='block text-lg font-semibold mb-2 text-[#FFD700]'>Bio</label>
                <textarea 
                value = {bio} 
                onChange={(e)=>setBio(e.target.value)}
                className='w-full h-[7rem] bg-[#2d2d44] text-white p-6 rounded-lg outline-none border border-gray-600 focus:border-[#FFD700] transition duration-300 resize-none'
                
                ></textarea>
                <LoadingButton isLoading={isLoading} size={"lg"}
                                   className="mt-6 cursor-pointer  bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold px-6 py-2 rounded-xl shadow-lg hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300"

                     onClick={handleUpdateProfile}
                     >
                        Change Bio
                </LoadingButton>

            </div>
            <div className='mt-12'>
                <h1 className='text-2xl font-bold text-[#FFD700] mb-2'>
                    Change Password
                </h1>
                <form onSubmit={handlePasswordChange} className="mt-8 mb-8">
                <div className='w-full md:w-[80%] lg:w-[60%] text-black'>
                        <PasswordInp
                        name="currentpassword"
                        value={currentPassword}
                        label='Current Password'
                        onChange={(e)=>setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className='w-full md:w-[80%] text-black lg:w-[60%] mt-4 mb-4'>
                        <PasswordInp
                        name="newpassword"
                        value={newPassword}
                        label='New Password'
                        onChange={(e)=>setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className='w-full md:w-[80%] text-black lg:w-[60%]'>
                        <PasswordInp
                        name="confirmnewpassword"
                        value={newPasswordConfirm}
                        label='Confirm New Password'
                        onChange={(e)=>setNewPasswordConfirm(e.target.value)}
                        />
                    </div>
                    <div className='mt-6'>
                    <LoadingButton
                    isLoading={isLoading}
                    type='submit'
                    className="bg-gradient-to-r cursor-pointer from-red-600 to-red-400 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:from-red-700 hover:to-red-500 transition-all duration-300">
                    Change Password
                    </LoadingButton>

                    </div>
                </form>
            </div>

        </div>
      </div>
    </div>
  );
};

export default EditProfile;
