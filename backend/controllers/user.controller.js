import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";



export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try{
        const user = await User.findOne({ username }).select("-password -email -__v -createdAt -updatedAt -followers -following");
        if(!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);

    } catch (error) {
        console.log("Error in getUserProfile: " , error.message); 
        return res.status(500).json({ error: error.message });
       
    }
};

export const followUnfollowUser = async (req, res) => {

    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentuser = await User.findById(req.user._id);

        if (id === req.user._id .toString()) {
            return res.status(400).json({ message: "You cannot follow/unfollow yourself" });

        }

        if (!userToModify || !currentuser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = currentuser.following.includes(id);
        
   
        if (isFollowing) {
            // Unfollow
           await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
           await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });    
           
           //TODO return id of user as response

           res.status(200).json({ message: "User unfollowed successfully" });

        } else {
            // Follow
           await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
           await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
           //send notification to user
           const newNotification = new Notification({
            from: req.user._id,
            to: userToModify._id,
            type: 'follow'
           });
           await newNotification.save();

           //TODO return id of user as response
           res.status(200).json({ message: "User followed successfully" });

           
        }

    } catch (error) {
        console.log("Error in followUnfollowUser: " , error.message); 
        return res.status(500).json({ error: error.message });
    }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // get current user following list
    const currentUser = await User.findById(userId).select("following");
    const followingIds = currentUser.following || [];

    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { 
            $ne: userId,               // not me
            $nin: followingIds        // not already followed
          }
        }
      },
      { $sample: { size: 4 } },       // random 4 users
      {
        $project: {                   // hide sensitive fields
          password: 0,
          __v: 0
        }
      }
    ]);

    res.status(200).json(suggestedUsers);

  } catch (error) {
    console.log("Error in getSuggestedUsers:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { username, fullName, email, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({
        message: "Both current and new passwords are required to change password"
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.log("Error in updateUserProfile:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
