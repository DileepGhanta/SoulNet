    const User = require("../models/userModel");
    const AppError = require("../utils/appError");
    const catchAsync = require("../utils/catchAsync");
    const { uploadToCloudinary } = require("../utils/cloudinary");
    const getDataUri = require("../utils/dataUri");

    exports.getProfile = catchAsync(async(req,res,next)=>{
        const {id} = req.params;
        // /user/23982u9934, this is paramns


        const user = await User.findById(id).select("-password -otp -otpExpires -resetpasswordOtp -resetpasswordOtpExpires -passwordConfirm"
        ).populate({
            path: 'posts',
            options:{sort:{createdAt: -1}},
        }).populate({
            path: "savePosts",
            options:{sort:{createdAt: -1}},
        });

        if(!user){
            return next(new AppError("User Not Found",404));
        }

        res.status(200).json({
            status: "Success",
            data:{
                user,
            }
        })
    })

     //I changed this logic if any error consider this code again
    exports.editProfile = catchAsync(async (req, res, next) => {
        const userId = req.user.id;
        const { bio } = req.body;
        const profilePicture = req.file;
    
        let updateData = {};
        
        if (bio) updateData.bio = bio;
    
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            const cloudResponse = await uploadToCloudinary(fileUri);
            updateData.profilePicture = cloudResponse.secure_url;
        }
    
        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
            select: "-password -otp -otpExpires -resetpasswordOtp -resetpasswordOtpExpires -passwordConfirm"
        });
    
        if (!user) {
            return next(new AppError("User not found", 404));
        }
    
        return res.status(200).json({
            message: "Profile Updated",
            status: "Success",
            data: {
                user,
            }
        });
    });
    


    exports.suggestedUser = catchAsync(async(req,res,next)=>{
        const loginUserId = req.user.id;

        const users= await User.find({_id: {$ne: loginUserId}}).select("-password -otp -otpExpires -resetpasswordOtp -resetpasswordOtpExpires -passwordConfirm");
        

        res.status(200).json({
            status: "Success",
            data:{
                users,
            },
        })
    })


    exports.followUnfollow = catchAsync(async(req,res,next)=>{
        const loginUserId = req.user.id;
        const targetUserId = req.params.id;


        if(loginUserId.toString() === targetUserId){
            return next(new AppError("You cannot follow or unfollow yourself",400))
        }


        const targetUser = await User.findById(targetUserId);

        if(!targetUser){
            return next(new AppError("User Not Found", 404));
        }


        const isFollowing = targetUser.followers.includes(loginUserId);

        if(isFollowing){
            await Promise.all([
                User.updateOne(
                    {_id: loginUserId},
                    {$pull:{following: targetUserId}}
                ),
                User.updateOne(
                    {_id: targetUser},
                    {$pull:{followers: loginUserId}}
                )
            ]) 
        }

        else{
            await Promise.all([
                User.updateOne(
                    { _id: loginUserId},
                    {$addToSet:{following:targetUserId}}
                ),
                User.updateOne(
                    {_id: targetUser},
                    {$addToSet:{followers:loginUserId}}
                )
            ])
        }


        const updatedLoggedInUser = await User.findById(loginUserId).select("-password");

        res.status(200).json({
            message: isFollowing ? "Unfollowed Successfully" : "Followed Successfully",
            status: "Success",
            data:{
                user: updatedLoggedInUser,
            }
        })
    })


    exports.getMe = catchAsync(async(req,res,next)=>{
        const user =req.user;
        if(!user){
            return next(new AppError("User Not Authenticated", 404 ));
        }

        res.status(200).json({
            status: "Success",
            message: "Authenticated User",
            data:{
                user,
            }
        })
    })