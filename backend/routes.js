'use strict';
const mongoose = require('mongoose');
const PostModel = require('./models/Post');
const UserModel = require('./models/User');
const slugify = require('./src/lib/slugify');
const bcrypt = require('bcrypt');
const generateSitemap = require('./src/lib/sitemap');

module.exports = function (app, opts) {
  app.get('/', async (req, res, next) => {
    const postsPerPage = 8;
    const authorized = req.session.authorized || false;
    try {
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * postsPerPage;

      const postsInDB = await PostModel.find().sort({ date: -1 }).skip(skip).limit(postsPerPage);

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
      const authorized = req.session.authorized;
      if (authorized) {
        res.render('add-post', {
          doctitle: 'add new post',
          authorized,
          postId: null,
          postTitle: null,
          postContent: null,
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
   	  hasCode: req.body.hasCode,
          date: req.body.date || Date.now(),
        };

        const newPost = new PostModel(postData);
        await newPost.save();
        await generateSitemap(newPost.slug);
        res.json({ success: true, post: newPost });
      } catch (error) {
        console.error(error);
        next(error);
      }
    });

  app
    .route('/post/edit/:id')
    .get(async (req, res) => {
      try {
        const post = await PostModel.findById(req.params.id);

        const authorized = req.session.authorized;
        if (authorized) {
          res.render('add-post', {
            doctitle: 'Edit Post',
            authorized,
            postId: post._id,
            postTitle: post.title,
            postContent: post.content,
          });
        } else {
          res.redirect('/auth/login');
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })
    .put(async (req, res, next) => {
      try {
        // Input validation
        if (!req.body.title || !req.body.content) {
          return res.status(400).json({
            success: false,
            error: 'Title and content are required fields.',
          });
        }

        const postId = req.params.id;
        const slug = slugify(req.body.title);
        const postData = {
          title: req.body.title,
          slug: slug,
          tags: req.body.tags,
          content: req.body.content,
	  hasCode: req.body.hasCode,
        };

        // Update the existing post
        const updatedPost = await PostModel.findByIdAndUpdate(
          postId,
          postData,
          {
            new: true, // Return the updated document
          }
        );

        if (!updatedPost) {
          return res.status(404).json({
            success: false,
            error: 'Post not found.',
          });
        }

        res.json({ success: true, post: updatedPost });
      } catch (error) {
        console.error(error);
        next(error);
      }
    });

  app.get('/post/delete/:id', async (req, res) => {
    try {
      const authorized = req.session.authorized;
      if (!authorized) {
        return res.status(401).send('Unauthorized');
      }

      const postId = req.params.id;

      const post = await PostModel.findById(postId);

      if (!post) {
        return res.status(404).send('Post not found');
      }

      await PostModel.deleteOne({ _id: postId });

      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/post/:slug', async (req, res) => {
    try {
      const authorized = req.session.authorized;
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
	postHasCode: post.hasCode,
        authorized: authorized,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/post/toggle-visibility/:id', async (req, res) => {
    try {
      const authorized = req.session.authorized;

      if (!authorized) {
        return res.status(401).send('Unauthorized');
      }

      const postId = req.params.id;
      const post = await PostModel.findById(postId);

      if (!post) {
        return res.status(404).send('Post not found');
      }

      post.isVisible = !post.isVisible;
      await post.save();

      res.redirect('/');
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
      // Redirect to the home page if already authorized
      if (req.session.authorized) {
        res.redirect('/');
      } else {
        res.render('login-page');
      }
    })
    .post(async (req, res, next) => {
      try {
        // Check if both username and password are provided
        if (!req.body.username || !req.body.password) {
          return res.status(400).send('Username and password are required.');
        }

        const { username, password } = req.body;
        const user = await UserModel.findOne({ username });

        // Check if the user exists
        if (!user) {
          return res
            .status(401)
            .render('login-page', { message: 'Invalid username or password.' });
        }

        // Compare the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          // Set session variables for authentication
          req.session.user = user;
          req.session.authorized = true;
          res.redirect('/');
        } else {
          // Incorrect password
          req.session.user = null;
          req.session.authorized = false;
          return res
            .status(401)
            .render('login-page', { message: 'Invalid username or password.' });
        }
      } catch (err) {
        // Log the error and send an appropriate response
        console.error('Error in login route (POST):', err);
        res.status(500).send('Internal Server Error');
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
            message:
              'This is a single-account website. Please login with your account.',
          });
        }
      } catch (err) {
        // Log the error and send an appropriate response
        console.error('Error in signup route (GET):', err);
        res.status(500).send('Internal Server Error');
      }
    })
    .post(async (req, res, next) => {
      try {
        // Check if both username and password are provided
        if (!req.body.username || !req.body.password) {
          return res.status(400).send('Username and password are required.');
        }

        const { username, password } = req.body;

        // Check if the username is already taken
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
          return res.status(400).send('Username is already taken.');
        }

        // Hash the password
        bcrypt.hash(password, 12, async (err, hash) => {
          if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Internal Server Error');
          }

          const newUser = new UserModel({
            username: username,
            password: hash,
          });

          await newUser.save();
          res.render('add-post');
        });
      } catch (err) {
        console.error('Error in signup route (POST):', err);
        res.status(500).send('Internal Server Error');
      }
    });

  app.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/');
    });
  });

  app.get('/sitemap.xml', (req, res, next)=> {
    // let xml_content = [
    //   '<?xml version="1.0" encoding="UTF-8"?>',
    //   '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    //   '  <url>',
    //   '    <loc>http://www.example.com/</loc>',
    //   '    <lastmod>2005-01-01</lastmod>',
    //   '  </url>',
    //   '</urlset>'
    // ]
    res.set('Content-Type', 'text/xml')
    res.send('/sitemap.xml');
    // res.send(xml_content.join('\n'))
  })
};
