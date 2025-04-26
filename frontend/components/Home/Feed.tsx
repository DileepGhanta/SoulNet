'use client'

import { RootState } from '@/Store/store'
import { BASE_API_URL } from '@/server'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { handleAuthRequest } from '../utils/apiRequest'
import { addComment, likeOrDislike, setPost } from '@/Store/postSlice'
import {Bookmark, HeartIcon, Loader, MessageCircle, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
// import noPostsImg from '../images/NOPOSTS.png'; // adjust path as needed
import DotButton from '../Helper/DotButton'
import Image from 'next/image'
import Comment from '../Helper/Comment'
import { toast } from 'sonner'


import { setAuthUser } from '@/Store/authSlice'
import { useRouter } from 'next/navigation'
// import { Button } from '../ui/button'


const Feed = () => {

  const [activePostId, setActivePostId] = useState<string | null>(null);

  const router = useRouter( )

  const user = useSelector((state:RootState) => state.auth.user);
  const posts = useSelector((state:RootState) => state.post.posts);

  const [comment,setComment]= useState('');
  const [isLoading,setIsLoading] = useState(false);

  console.log("POSTS",posts)

  const dispatch = useDispatch();

  useEffect(()=>{
    const getALLPost = async()=>{
      const getALLPostReq = async() => axios.get(`${BASE_API_URL}/posts/all`);

      const result = await handleAuthRequest(getALLPostReq,setIsLoading);
      if(result){
        dispatch(setPost(result.data.data.posts))
      }
    }; 
    getALLPost();
  },[dispatch])

  
//it will receive the id(string) of post you want to like
  const handleLikeAndDislike = async(id:string) =>{
    const result = await axios.post(`${BASE_API_URL}/posts/like-dislike/${id}`,{},{
      withCredentials:true
    });

    if(result.data.status === "Success"){
      if(user?._id){
        dispatch(likeOrDislike({postId:id,userId:user?._id}))
        toast(result.data.message)
      }


    }
  }




  const handleSaveUnsave = async(id:string)  =>{
    const result = await axios.post(`${BASE_API_URL}/posts/save-unsave-post/${id}`,{},{
      withCredentials:true
    });

    if(result.data.status === 'Success'){
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message)
    }
  }





  const handleComment = async(id:string) =>{
    if(!comment) return ;
    const addCommentReq = async() => await axios.post(`${BASE_API_URL}/posts/comment/${id}`,{text:comment},{
      withCredentials:true
    });

    const result = await handleAuthRequest(addCommentReq)

    if(result?.data.status === 'Success'){
      dispatch(addComment({postId:id,comment:result?.data.data.comment}));
      toast.success("Comment Posted");
      setComment('');
    }

  }



  //Handling handle state 

  if(isLoading){
    return <div className='w-full h-screen flex items-center justify-center flex-col'>
      <Loader className='animate-spin'/>
    </div>
  }

  if (posts.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] pb-10 px-4 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
        <img 
          src="/images/NOPOSTS.png" 
          alt="No posts" 
          className="w-72 max-w-full h-auto object-contain"
        />
        {/* <p className="text-xl mt-4 font-semibold text-gray-600">No posts to show</p> */}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] pt-14 pb- 14px-4">
      <div className="w-[80%] max-w-3xl mx-auto">
        {posts.map((post) => (
          <div
            key={post._id}
            className="mt-10 bg-[#1f2937]/80 backdrop-blur-lg rounded-2xl border
             border-white/10 shadow-[0_0_25px_rgba(100,116,139,0.2)] hover:shadow-[0_0_35px_rgba(165,180,252,0.3)] "
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3"
                  onClick={() => router.push(`/profile/${post.user?._id}`)}
                  >
                <Avatar className="w-10 h-10 ring-2 ring-purple-600">
                  <AvatarImage
                    src={post.user?.profilePicture}
                    className="h-full w-full rounded-full object-cover"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h1 className="text-white font-semibold">{post.user?.username}</h1>
              </div>
              <DotButton post={post} user = {user} />
            </div>
  
            {/* Image */}
            <div className="px-4">
              <Image
                src={`${post.image?.url}`}
                priority
                alt="Post"
                width={400}
                height={400}
                className="w-full rounded-xl object-cover border border-white/10 shadow-md"
              />
            </div>
  
            {/* Icons */}
            <div className="mt-4 px-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-5">
                <HeartIcon className={`cursor-pointer  hover:scale-110 transition-transform ${user?._id && post.likes.includes(user?._id) 
                ?"text-red-500": ''}`}
                onClick={()=>{handleLikeAndDislike(post?._id)}} />
                <MessageCircle className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setActivePostId(post._id)} />
                <Send className="cursor-pointer hover:scale-110 transition-transform" />
              </div>
              <Bookmark
                onClick={() => handleSaveUnsave(post?._id)}
                className={`cursor-pointer text-gray-500 ${
                  (user?.savePosts as string[])?.some(
                    (savePostId: string) => savePostId === post._id
                  )
                    ? "text-red-500"
                    : " "
                }`}
              />
            </div>
  
            {/* Likes */}
            <h1 className="mt-3 px-4 text-sm font-semibold text-white">{post.likes.length} likes</h1>
  
            {/* Caption */}
            <p className="mt-2 px-4 font-medium text-gray-300">{post.caption}</p>
  
            {/* Comments */}
            <div className="px-4 text-white pt-2">
              <Comment post={post} user={user}/>
            </div>
  
            {/* Add Comment */}
            <div className="mt-3 px-4 pb-4 flex items-center">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-white placeholder:text-gray-500 border-b border-gray-700 focus:outline-none px-2 pb-1"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p
                role="button"
                className="ml-3 text-sm font-semibold text-purple-500    cursor-pointer"
                onClick={() => handleComment(post._id)}
              >
                Post
              </p>
            </div>
  
            {/* Divider */}
            <div className="border-t border-white/10">

            </div>
          </div>
        ))}
      {activePostId && (
      <Comment
        post={posts.find((p) => p._id === activePostId)!}
        user={user}
        onClose={() => setActivePostId(null)}
      />
    )}
      </div>
    </div>
  )
}  

export default Feed