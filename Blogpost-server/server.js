const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors())
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Use routes
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});
