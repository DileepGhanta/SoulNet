import ProfilePage from '@/components/ProfilePage/ProfilePage';
import React from 'react'

const Profilepage = async ({ params }: { params: { id: string } }) => {
    const id = (await params).id;  
    // console.log(Params)
    
  return(
    <ProfilePage id = {id} />
  )
  
}

export default Profilepage