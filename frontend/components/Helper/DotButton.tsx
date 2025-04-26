'use client'
import { Post, User } from '@/types'
import React from 'react'
import { useDispatch } from 'react-redux'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Ellipsis } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useFollowUnfollow } from '../hooks/use-auth'
import axios from 'axios'
import { BASE_API_URL } from '@/server'
import { handleAuthRequest } from '../utils/apiRequest'
import { deletePost } from '@/Store/postSlice'
import { toast } from 'sonner'
import { redirect, useRouter } from 'next/navigation'

type Props = {
    post:Post |null,
    user: User | null
}



const DotButton = ({post,user}: Props) => {
  const  router = useRouter()
  const redirectHome = () => {
    // router.push('/');
    redirect("/");
  };

  const {handleFollowUnfollow} = useFollowUnfollow()

    const isOwnPost = post?.user?._id === user?._id
    const isFollowing  = post?.user?._id ? user?.following.includes(post.user._id):false; 

    const dispatch = useDispatch();

    const handleDeletePost = async() =>{
      const deletePostReq = async() =>await axios.delete(`${BASE_API_URL}/posts/delete-post/${post?._id}`,{
        withCredentials:true
      })

      const result = await handleAuthRequest(deletePostReq);

      if(result?.data.status === "Success"){
        if(post?._id){
          dispatch(deletePost(post?._id))
          toast.success(result?.data.message)
          redirect("/")
        }
      }
    };


    return (
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Ellipsis className="w-8 h-8 cursor-pointer text-white hover:text-purple-400 transition-colors duration-300" />
            </DialogTrigger>
      
            <DialogContent className="bg-[#0f172a]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl text-white">
              <DialogTitle className="text-lg font-semibold text-center">Post Options</DialogTitle>
      
              <div className="mt-6 space-y-4 flex flex-col items-center text-sm font-medium">
                {!isOwnPost && (
                 <Button onClick={()=>{if(post?.user?._id) handleFollowUnfollow(post?.user._id)}}
                 className={`w-48 transition-all duration-300 hover:scale-[1.02] ${
                   isFollowing ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"
                 }`}
               >
                 {isFollowing ? "Unfollow" : "Follow"}
               </Button>
               
                )}
      
            <Link href={`/profile/${post?.user?._id}`} className="w-full flex justify-center">
            <Button
                className="w-48 bg-green-600 hover:bg-green-700 text-white hover:scale-[1.02] transition-transform cursor-pointer"
            >
            About this Account
            </Button>
            </Link>

                {isOwnPost && (
                  <Button
                    variant="destructive"
                    onClick={handleDeletePost}
                    className="w-48 hover:scale-[1.02]  cursor-pointer transition-transform"
                  >
                    Delete Post
                  </Button>
                )}
      
                <DialogClose asChild>
                  <Button
                    
                    className="text-gray-400 hover:text-white cursor-pointer hover:scale-[1.02]
                     transition-transform  hover:bg-white/10 w-48">
                    Cancel
                  </Button>
                </DialogClose>
                {/* <Link href={router} className="w-full flex justify-center"> */}
              
              
            {/* </Link> */}
                
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
}
      

export default DotButton