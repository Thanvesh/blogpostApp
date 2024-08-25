const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BlogUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String },  // URL of the profile picture
    bio: { type: String },
    contact: { type: String },
});

BlogUserSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

module.exports = mongoose.model('User', BlogUserSchema);
