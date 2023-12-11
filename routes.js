'use strict';
const mongoose = require('mongoose');
const PostModel = require('./models/Post');
const slugify = require('./src/lib/slugify');

module.exports = function (app, opts) {
  app.get('/', async (req, res, next) => {
    try {
      // Fetch all posts from the database
      const postsInDB = await PostModel.find();

      // Adjust the content of each post to include only the first 50 characters
      const allPosts = postsInDB.map((post) => ({
        ...post.toObject(), // Assuming `post` is a Mongoose document, use `toObject` to convert it to a plain JavaScript object
        content: post.content.slice(0, 250),
        date: post.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      }));

      // Render a view to display all posts (adjust the view name as needed)
      res.render('index', { posts: allPosts });
    } catch (error) {
      // Handle any errors
      console.error(error); // Log the error
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.post('/posts/create', async (req, res, next) => {
    try {
      // Validate the presence of required fields
      if (!req.body.title || !req.body.content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required fields.',
        });
      }
      const slug = slugify(req.body.title);
      // Create postData object
      const postData = {
        title: req.body.title,
        slug: slug,
        tags: req.body.tags,
        content: req.body.content,
      };

      // Set date if provided, otherwise use current date
      postData.date = req.body.date || Date.now();

      const newPost = new PostModel(postData);
      await newPost.save();

      res.json({ success: true, post: newPost });
    } catch (error) {
      next(error);
    }
  });

  app.get('/posts/:slug', async (req, res) => {
    try {
      const postInDB = await PostModel.findOne({ slug: req.params.slug });
      const post = {
        ...postInDB.toObject(),
        date: postInDB.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      if (!post) {
        // Handle the case where the post is not found
        res.status(404).send('Post not found');
        return;
      }

      // Render the 'post' view using layout.pug as the layout
      res.render('post', {
        doctitle: post.title, // Set the title for layout.pug
        postTitle: post.title,
        postDate: post.date,
        postContent: post.content,
      });
    } catch (error) {
      // Handle any errors that occur during the query
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
};
