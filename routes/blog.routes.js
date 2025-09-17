
import express from "express";
import { createBlog,getBlogById,deleteBlog,updateBlog,getBlogs,addComment }
 from "../controllers/blogController.js";
const router = express.Router();

router.post("/", createBlog);          
router.get("/", getBlogs);            
router.get("/:id", getBlogById);       
router.put("/:id", updateBlog);        
router.delete("/:id", deleteBlog);     
router.post("/:blogId/comments", addComment);

export default router;
