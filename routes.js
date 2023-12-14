'use strict';
const mongoose = require('mongoose');
const PostModel = require('./models/Post');
const UserModel = require('./models/User');
const slugify = require('./src/lib/slugify');

module.exports = function (app, opts) {
  app.get('/', async (req, res, next) => {
    const postsPerPage = 8;
    const authorized = req.session.authorized || false;
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
        authorized: authorized,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app
    .route('/post/add')
    .get((req, res) => {
      if (req.session.authorized) {
        res.render('add-post', {
          doctitle: 'add new post',
        });
      } else {
        res.redirect('/auth/login');
      }
    })
    .post(async (req, res, next) => {
      try {
        // Input validation
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
          date: req.body.date || Date.now(),
        };

        const newPost = new PostModel(postData);
        await newPost.save();

        res.json({ success: true, post: newPost });
      } catch (error) {
        console.error(error);
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
    const authorized = req.session.authorized;
    res.render('me', {
      doctitle: 'about me',
      authorized: authorized,
    });
  });

  app
    .route('/auth/login')
    .get((req, res, next) => {
      if (req.session.authorized) {
        res.redirect('/');
      } else {
        res.render('login-page');
      }
    })
    .post(async (req, res, next) => {
      if (req.body.username && req.body.password) {
        const { username, password } = req.body;
        const user = await UserModel.findOne({ username: username });

        if (user.password === password) {
          req.session.user = user;
          req.session.authorized = true;
          res.redirect('/');
        } else {
          req.session.user = null;
          req.session.authorized = false;
          res.redirect('/auth/login');
        }
      }
    });

  app
    .route('/auth/signup')
    .get(async (req, res, next) => {
      try {
        const users = await UserModel.find();
        if (users.length < 1) {
          res.render('signup-page');
        } else {
          res.render('login-page', {
            message: 'An account already exists. Please login.',
          });
        }
      } catch (err) {
        res.send('An error occured : ' + err.message);
      }
    })
    .post(async (req, res, next) => {
      if (req.body.username && req.body.password) {
        const { username, password } = req.body;

        const newUser = new UserModel({
          username: username,
          password: password,
        });
        newUser.save();

        // res.cookie('username', username, { secure: true });
        res.render('add-post');
      } else {
        res.send('Not add to the database!');
      }
    });

  app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/');
    });
  });
};
