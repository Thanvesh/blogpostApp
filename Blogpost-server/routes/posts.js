const express = require('express');
const Post = require('../models/Post');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// GET /posts - List all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name profilePic')  // Populate author info
            .populate('comments.user', 'name profilePic');  // Populate user info in comments
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /posts/:id - Get a specific post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name profilePic bio email',)  // Populate author info
            .populate({
                path: 'comments.user',
                select: 'name profilePic'
            });  // Populate user info in comments
        res.json(post);

        console.log(post)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts - Create a new post
router.post('/', verifyToken, async (req, res) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imageUrl: req.body.imageUrl,  // Assuming imageUrl is sent from the frontend

        author: req.user.userId  // Save user's _id instead of name
    });

    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /posts/:id - Update a post
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user.userId.toString()) return res.status(403).json({ message: 'Unauthorized' });

        post.title = req.body.title;
        post.content = req.body.content;
        post.imageUrl = req.body.imageUrl;  // Allow image URL update
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /posts/:id - Delete a post
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user.userId.toString()) return res.status(403).json({ message: 'Unauthorized' });

        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/comments - Add a new comment to a post
router.post('/:id/comments', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const newComment = {
            user: req.user.userId,  // Save user's _id
            comment: req.body.comment,
        };
        post.comments.push(newComment); 
        await post.save();
         // Populate user info for the response

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /posts/:postId/comments/:commentId - Edit a comment
router.put('/:postId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const comment = post.comments.id(req.params.commentId);

        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.user.toString() !== req.user.userId.toString()) return res.status(403).json({ message: 'Unauthorized' });

        comment.comment = req.body.comment;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /posts/:postId/comments/:commentId - Delete a comment
router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        // Find the post by its ID
        const post = await Post.findById(req.params.postId);

        // Find the comment to remove
        const comment = post.comments.id(req.params.commentId);

        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.user.toString() !== req.user.userId.toString()) return res.status(403).json({ message: 'Unauthorized' });

        // Remove the comment from the comments array
        post.comments.pull(req.params.commentId);

        // Save the updated post
        await post.save();

        // Send the updated post as a response
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
