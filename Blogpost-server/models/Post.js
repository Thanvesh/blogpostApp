const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },  // URL of the post's image
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', BlogPostSchema);
