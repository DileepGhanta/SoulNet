'use client'

import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import Image from 'next/image';
import LoadingButton from '../Helper/LoadingButton';
import { Button } from '../ui/button';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { BASE_API_URL } from '@/server';
import { handleAuthRequest } from '../utils/apiRequest';
import { addPost } from '@/Store/postSlice';


type Props = {
    isOpen: boolean,
    onClose: () =>void;
}

const CreatePostModel  = ({isOpen,onClose}: Props) => {

    const router = useRouter();
    const dispatch = useDispatch()
    const [selectedImage,setSelectedImage] = useState<File | null>(null)
    const [previewImage, setPreviewImage]= useState<string | null>(null)
    const [caption, setCaption] = useState<string>('');
    const [isLoading,setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(()=>{
        if(!isOpen){
            setSelectedImage(null);
            setPreviewImage(null);
            setCaption('')
        }

    },[isOpen])

    const handleButtonClick = () =>{
        if(fileInputRef.current){
            fileInputRef.current.click()
        }
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) =>{

        //Here we are validating file type 


        if(event.target.files && event.target.files[0]){
            const file = event.target.files[0];
            if(!file.type.startsWith("image/")){
                toast.error("Please select a valid Image file");
                return;
            }

            //Here we are checking whether the image has valid size or not 

            if(file.size> 10*1024*1024){
                toast.error("File size should not exceed 10MB")
            }

            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(file);
            setPreviewImage(imageUrl);
            


        }
    };

    const handleCreatePost = async() => {
        if(!selectedImage){
            toast.error("Please Select an image to create a post!! ")

        }

        const formData = new FormData();
        formData.append("caption", caption);
        if(selectedImage){
            formData.append("image",selectedImage)
        }

        const createPostReq = async()=> await axios.post(`${BASE_API_URL}/posts/create-post`,formData,
        {withCredentials:true,headers:{
            "Content-Type": "multipart/form-data"
        },

     })
     const result = await handleAuthRequest(createPostReq,setIsLoading);

     if(result){
        dispatch(addPost(result.data.data.post))
        toast.success("Post Created Successfully");
        setPreviewImage(null);
        setCaption("");
        setSelectedImage(null);
        onClose();
        router.push('/');
        router.refresh();
    }

    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent
            className="bg-[#111827]/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-6 transition-all duration-500 ease-in-out animate-slide-up"
          >
            {previewImage ? (
              <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
                <Image
                  src={previewImage}
                  alt="Selected"
                  width={400}
                  height={400}
                  className="rounded-xl max-h-96 object-contain border border-white/10 shadow-lg transition-all duration-500 animate-slide-up"
                />
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full px-4 py-2 bg-[#1f2937] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 transition-all duration-300 animate-slide-up"
                />
                <div className="flex gap-4 mt-2 animate-slide-up">
                  <LoadingButton
                    onClick={handleCreatePost} // Add function for creating post
                    isLoading={isLoading} // Add loading indicator
                    className="bg-gradient-to-r from-purple-600 cursor-pointer to-indigo-600 text-white px-5 py-2 rounded-lg hover:brightness-110 transition-all duration-300"
                  >
                    Create Post
                  </LoadingButton>
                  <Button
                    className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300"
                    onClick={() => {
                      setPreviewImage(null);
                      setSelectedImage(null);
                      setCaption('');
                      onClose(); // Close the modal when cancelled
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-white text-center text-xl cursor-pointer font-semibold animate-fade-in">
                    Upload Photo
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-6 text-gray-300 mt-4 animate-slide-up">
                  <div className="p-4 bg-[#1f2937] rounded-full shadow-md transition-transform duration-300 hover:scale-105">
                    <ImageIcon size={40} />
                  </div>
                  <p className="transition-opacity duration-300">Select a photo from your device 😁</p>
                  <Button
                    onClick={handleButtonClick} // Open file input
                    className=" bg-gradient-to-r cursor-pointer from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300"
                  >
                    Select an Image
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden cursor-pointer"
                    ref={fileInputRef} // Using ref to handle file input
                    onChange={handleFileChange} // Handle file change function
                  />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      );
}        
export default CreatePostModel 