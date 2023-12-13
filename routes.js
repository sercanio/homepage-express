'use strict';
const mongoose = require('mongoose');
const PostModel = require('./models/Post');
const slugify = require('./src/lib/slugify');

module.exports = function (app, opts) {
  app.get('/', async (req, res, next) => {
    const postsPerPage = 8;
    try {
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * postsPerPage;

      const postsInDB = await PostModel.find().skip(skip).limit(postsPerPage);

      const allPosts = postsInDB.map((post) => ({
        ...post.toObject(),
        content: post.content.slice(0, 250),
        date: post.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      }));

      const totalPosts = await PostModel.countDocuments();
      const totalPages = Math.ceil(totalPosts / postsPerPage);

      res.render('index', {
        posts: allPosts,
        currentPage: page,
        totalPages,
        doctitle: 'sercan ateş | web logs',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.post('/post/create', async (req, res, next) => {
    try {
      if (!req.body.title || !req.body.content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required fields.',
        });
      }
      const slug = slugify(req.body.title);
      const postData = {
        title: req.body.title,
        slug: slug,
        tags: req.body.tags,
        content: req.body.content,
      };

      postData.date = req.body.date || Date.now();

      const newPost = new PostModel(postData);
      await newPost.save();

      res.json({ success: true, post: newPost });
    } catch (error) {
      next(error);
    }
  });

  app.get('/post/:slug', async (req, res) => {
    try {
      const postInDB = await PostModel.findOne({ slug: req.params.slug });
      const post = {
        ...postInDB.toObject(),
        date: postInDB.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      };

      if (!post) {
        res.status(404).send('Post not found');
        return;
      }

      res.render('post', {
        doctitle: post.title,
        postTitle: post.title,
        postDate: post.date,
        postContent: post.content,
        postSlug: post.slug,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/me', (req, res) => {
    res.render('me', {
      doctitle: 'about me',
    });
  });
};
