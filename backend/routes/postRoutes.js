const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const upload = require('../middleware/multer');
const { createPost, getAllPosts, getUserPosts, saveOrUnsavePosts, deletePost, likeOrDislikePost, addComment } = require('../controllers/postController');


const router = express.Router();


//define routes

router.post("/create-post",isAuthenticated,upload.single('image'), createPost)
router.get("/all",getAllPosts)
router.get("/user-post/:id",getUserPosts);
router.post("/save-unsave-post/:postId", isAuthenticated,saveOrUnsavePosts)
router.delete("/delete-post/:id",isAuthenticated,deletePost)
router.post("/like-dislike/:id",isAuthenticated,likeOrDislikePost)
router.post("/comment/:id", isAuthenticated, addComment);











module.exports = router;