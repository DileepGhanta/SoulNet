import { User } from '@/types'
import { Heart, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

type Props={
    userProfile:User | undefined
}

const Post = ({ userProfile }: Props) => {
  console.log(userProfile);

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
      {userProfile?.posts.map((post) => {
        return (
          <div
            key={post._id}
            className="relative group overflow-hidden rounded-2xl shadow-lg border border-white/10 bg-[#0f172a]/40 backdrop-blur-md transition-transform hover:scale-[1.02]"
          >
            {/* Post Image */}
            <Image
              src={`${post?.image?.url}`}
              alt="Post"
              width={300}
              height={300}
              className="w-full h-full cursor-pointer object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center
            justify-center ">
             <div className="flex justify-center items-center space-x-6 h-full">
              <button className="p-2 rounded-full text-white space-x-2 flex items-center font-bold">
                <Heart className="w-7 h-7" />
                <span>{post?.likes.length}</span>
              </button>
              <button className="p-2 rounded-full text-white space-x-2 flex items-center font-bold">
                <MessageCircle className="w-7 h-7" />
                <span>{post?.comments.length}</span>
              </button>
            </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Post