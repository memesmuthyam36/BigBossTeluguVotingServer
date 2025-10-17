const express = require("express");
const router = express.Router();
const Contestant = require("../models/Contestant");
const BlogPost = require("../models/BlogPost");

// =====================
// CONTESTANT CRUD
// =====================

// Get all contestants
router.get("/contestants", async (req, res) => {
  try {
    const contestants = await Contestant.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: contestants,
    });
  } catch (error) {
    console.error("Error fetching contestants:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contestants",
      error: error.message,
    });
  }
});

// Create contestant
router.post("/contestants", async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !description || !image) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and image are required",
      });
    }

    const contestant = new Contestant({
      name,
      description,
      image,
      votes: 0,
    });

    await contestant.save();

    // Emit real-time update
    if (req.app.get("io")) {
      const allContestants = await Contestant.find();
      const totalVotes = allContestants.reduce((sum, c) => sum + c.votes, 0);
      req.app.get("io").emit("voteUpdate", {
        contestants: allContestants,
        totalVotes,
      });
    }

    res.status(201).json({
      success: true,
      message: "Contestant created successfully",
      data: contestant,
    });
  } catch (error) {
    console.error("Error creating contestant:", error);
    res.status(500).json({
      success: false,
      message: "Error creating contestant",
      error: error.message,
    });
  }
});

// Update contestant
router.put("/contestants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const contestant = await Contestant.findByIdAndUpdate(
      id,
      { name, description, image },
      { new: true, runValidators: true }
    );

    if (!contestant) {
      return res.status(404).json({
        success: false,
        message: "Contestant not found",
      });
    }

    // Emit real-time update
    if (req.app.get("io")) {
      const allContestants = await Contestant.find();
      const totalVotes = allContestants.reduce((sum, c) => sum + c.votes, 0);
      req.app.get("io").emit("voteUpdate", {
        contestants: allContestants,
        totalVotes,
      });
    }

    res.json({
      success: true,
      message: "Contestant updated successfully",
      data: contestant,
    });
  } catch (error) {
    console.error("Error updating contestant:", error);
    res.status(500).json({
      success: false,
      message: "Error updating contestant",
      error: error.message,
    });
  }
});

// Delete contestant
router.delete("/contestants/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const contestant = await Contestant.findByIdAndDelete(id);

    if (!contestant) {
      return res.status(404).json({
        success: false,
        message: "Contestant not found",
      });
    }

    // Emit real-time update
    if (req.app.get("io")) {
      const allContestants = await Contestant.find();
      const totalVotes = allContestants.reduce((sum, c) => sum + c.votes, 0);
      req.app.get("io").emit("voteUpdate", {
        contestants: allContestants,
        totalVotes,
      });
    }

    res.json({
      success: true,
      message: "Contestant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contestant:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting contestant",
      error: error.message,
    });
  }
});

// =====================
// BLOG POST CRUD
// =====================

// Get all blog posts
router.get("/blog", async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ publishDate: -1 });
    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog posts",
      error: error.message,
    });
  }
});

// Create blog post
router.post("/blog", async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      featuredImage,
      tags,
      author,
    } = req.body;

    if (
      !title ||
      !slug ||
      !excerpt ||
      !content ||
      !category ||
      !featuredImage
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if slug already exists
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: "A post with this slug already exists",
      });
    }

    const blogPost = new BlogPost({
      title,
      slug,
      excerpt,
      content,
      category,
      featuredImage,
      tags: tags || [],
      author: author || "Admin",
      publishDate: new Date(),
      viewCount: 0,
      shareCount: 0,
    });

    await blogPost.save();

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: blogPost,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({
      success: false,
      message: "Error creating blog post",
      error: error.message,
    });
  }
});

// Update blog post
router.put("/blog/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      featuredImage,
      tags,
      author,
    } = req.body;

    // Check if slug already exists for a different post
    const existingPost = await BlogPost.findOne({ slug, _id: { $ne: id } });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: "A post with this slug already exists",
      });
    }

    const blogPost = await BlogPost.findByIdAndUpdate(
      id,
      { title, slug, excerpt, content, category, featuredImage, tags, author },
      { new: true, runValidators: true }
    );

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.json({
      success: true,
      message: "Blog post updated successfully",
      data: blogPost,
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({
      success: false,
      message: "Error updating blog post",
      error: error.message,
    });
  }
});

// Delete blog post
router.delete("/blog/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const blogPost = await BlogPost.findByIdAndDelete(id);

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting blog post",
      error: error.message,
    });
  }
});

module.exports = router;
