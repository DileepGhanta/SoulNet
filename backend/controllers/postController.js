const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sharp = require('sharp');
const { uploadToCloudinary, cloudinary } = require("../utils/cloudinary");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");




exports.createPost = catchAsync(async(req,res,next)=>{
    const {caption} = req.body;
    const image = req.file;
    const userId = req.user._id

    if(!image){
        return next(new AppError("Image is required for the post",400))
    }

    //Optimise  the image , if the user uploaded a 4 to 6 mb image

    const optimisedImageBuffer = await sharp(image.buffer).resize(
        {width: 800,height: 800,fit: "inside",}
        ).toFormat("jpeg",{quality:80}).toBuffer();
    
    const fileUri = `data:image/jpeg;base64,${optimisedImageBuffer.toString("base64")}`;

    const cloudResponse = await uploadToCloudinary(fileUri);

    let post = await Post.create(
        {
            caption,
            image:{
                url: cloudResponse.secure_url,
                publicId: cloudResponse.public_id
            },
            user: userId,
        }
    );

    //add posts to user posts(where it shows all the posts posted by the user )

    const user = await User.findById(userId);

    if(user){
        user.posts.push(post.id);
        await user.save({validateBeforeSave: false})
    }

    post = await post.populate({
        path:'user',
        select: "username email bio profilePicture",
    });

    return res.status(200).json({
        status: "Success",
        message: "Post Created",
        data:{
            post,
        }
    })

})



exports.getAllPosts = catchAsync(async(req,res,next)=>{
    const posts = await Post.find().populate({
        path: 'user',
        select: "username profilePicture bio"
    }).populate({
        path: 'comments',
        select:"text user",
        populate:{
            path: 'user',
            select: "username profilePicture",
        },
    }).sort({createdAt: -1})

    return res.status(200).json({
        status: "Success",
        results: posts.length,
        data:{
            posts,
        }
    })
})


exports.getUserPosts = catchAsync(async(req,res,next)=>{
    const userId = req.params.id

    const posts = await Post.find({user: userId}).populate({
        path: 'comments',
        select:"text user",
        populate:{
            path: 'user',
            select: "username profilePicture",
        }
    }).sort({createdAt: -1})

    return res.status(200).json({
        status: "Success",
        results: posts.length,
        data:{
            posts, 
        }
    })
})



exports.saveOrUnsavePosts = catchAsync(async(req,res,next)=>{
    const userId = req.user.id;
    const postId = req.params.postId;

    const user = await User.findById(userId);

    if(!user){
        return next(new AppError("User not Found",404))
    }

    const isPostSave = user.savePosts.includes(postId);

    if(isPostSave){
        user.savePosts.pull(postId)  //deleting the postid from the savePosts array
        await user.save({validateBeforeSave: false});
        return res.status(200).json({
            status: "Success",
            message: "Post Unsaved Successfully",
            data:{
                user,
            }
        })
    }

    else{    //if post is not saved

        user.savePosts.push(postId);

        await user.save({validateBeforeSave: false})

        return res.status(200).json({
            status:"Success",
            message: "Post Saved Successfully",
            data:{
                user,
            }
        })
    }
    
})


exports.deletePost = catchAsync(async(req,res,next)=>{
    const {id} = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id).populate("user");

    if(!post){
        return next(new AppError("Post not found", 404))
    }

    if(post.user.id.toString()!== userId.toString()){
        return next(new AppError("You are not authorized to delete this post", 403));
    }


    //removing the post from the users post

    await User.updateOne({_id: userId},
        {$pull:{posts: id}}
    );

    //remove this post  from the users saveList
    //what if this post is saved in other users saved list we have to delete it tooo 

    await User.updateMany({savePosts:id},
        {$pull:{savePosts: id}}
    )

    //remove comments for this post toooo 

    await Comment.deleteMany({post: id});

    //Removing image from the cloudinary 

    if(post.image.publicId){
        await cloudinary.uploader.destroy(post.image.publicId); 
    }
    
    //remove the post 

    await Post.findByIdAndDelete(id);

    res.status(200).json({
        status: "Success",
        message: "Post deleted Successfully",
    })

})


exports.likeOrDislikePost = catchAsync(async(req,res,next)=>{
    const {id} = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if(!post){
        return next(new AppError("Post not found", 404));
    }

    const isLiked = post.likes.includes(userId); //if isLiked is true userr liked the post else it was not liked by the user 

    if(isLiked){
        await Post.findByIdAndUpdate(id,{$pull:{likes: userId}},
            {new: true}

        )
        
        return res.status(200).json({
            status: "Success",
            message: "Post disliked Successfully"
        });
    }
    else{
        await Post.findByIdAndUpdate(id,{$addToSet:{likes: userId}},
            {new: true}
        );  
        return res.status(200).json({
            status: "Success",
            message: "Post liked Successfully"
        });
    }

})


exports.addComment = catchAsync(async(req,res,next)=>{
    const {id:postId} = req.params;
    const userId = req.user._id;

    const {text} = req.body;

    const post = await Post.findById(postId);

    if(!post){
        return next(new AppError("Post not Found",404));
    }
    
    if(!text){
        return next(new AppError("Comment text is required",400))
    }

    const comment = await Comment.create({
        text,
        user: userId,
        createdAt: Date.now(),
    })

    post.comments.push(comment);

    await post.save({validateBeforeSave: false});

    await comment.populate({
        path: "user",
        select: "username profilePicture bio"
    })

    res.status(201).json({
        status: "Success",
        message: "Comment added Successfully",
        data:{
            comment,
        }
    })
})
