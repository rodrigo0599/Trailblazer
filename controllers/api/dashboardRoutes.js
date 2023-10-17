const router = require('express').Router();
const withAuth = require('../../utils/auth');
const imageData = require('../../seeds/imageData');
const { Explorer, Post, Comment } = require('../../models');

//Render the dashboard of the current explorer
router.get('/', withAuth, async (req, res) => {
  try {
    const explorerData = await Explorer.findByPk(req.session.userId, {
      attributes: { exclude: ['password'] },
      include: [{ model: Post }],
    });

    const explorer = explorerData.get({ plain: true });

    explorer.posts.forEach((post) => {
      post.isOwnPost = true
      post.author = explorer.username
    });

    res.render('dashboard', {
      ...explorer,
      loggedIn: req.session.loggedIn,
      user_id: req.session.userId,
      background: imageData[Math.floor(Math.random() * 4)].file_path,
      stylesheet: "/css/style.css"
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/', withAuth, async (req, res) => {


  if (req.body.newPassword) {
    console.log(req.body.newPassword);
    try {
      await Explorer.update({
        password: req.body.newPassword
      }, {
        where: {
          id: req.session.userId
        },
        individualHooks: true
      });

      res.status(200).json({ message: 'Password was encrypted with hashing algorithm and saved to the database.' });

    } catch (err) {
      res.status(400).json(err);
    };
  } else {
    try {
      await Explorer.update({
        email: req.body.email
      }, {
        where: {
          id: req.session.userId
        }
      });
      if (!req.body.email) {
        res.status(200).json({ message: "User was successfully unsubscribed from mailing list!" });
      } else {
        res.status(200).json({ message: 'Successfully added to the mailing list!' });
      };
    } catch (err) {
      res.status(400).json(err);
    };
  };
});

router.delete('/', withAuth, async (req, res) => {

  try {
    await Explorer.destroy({
      where: {
        id: req.session.userId
      }
    });
    req.session.destroy((err) => {
      if (err) {
        res.status(400).send('Unable to logout.');
      } else {
        res.status(200).json({ message: 'You are no longer in our crade.' });
      }
    });

  } catch (err) {
    res.status(500).json(err);
  }
})

//Render the view to add a new post.
router.get('/post', withAuth, async (req, res) => {
  try {

    const { username } = await Explorer.findByPk(req.session.userId, {
      attributes: ['username']
    });

    res.render('add-post', {
      username,
      loggedIn: req.session.loggedIn,
      user_id: req.session.userId,
      background: imageData[Math.floor(Math.random() * 4)].file_path,
      stylesheet: '/css/style.css'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

//Add a new post
router.post('/post', withAuth, async (req, res) => {
  try {

    const explorer_id = req.session.userId;

    await Post.create({ ...req.body, explorer_id });

    res.status(201).json({ message: 'New post added to the db.' });
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

//Render the view to update/modify or delete one of your own posts
router.get('/:id/edit', withAuth, async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id);
    const post = postData.get({ plain: true });
    const username = await Explorer.findByPk(req.session.userId);
    res.render('edit', {
      ...post,
      username,
      loggedIn: req.session.loggedIn,
      user_id: req.session.userId,
      background: imageData[Math.floor(Math.random() * 4)].file_path,
      stylesheet: '/css/style.css'
    });

  } catch (err) {
    res.status(500).json(err);
  }
});
//Update (modify) one of your own posts
router.put('/:id/edit', withAuth, async (req, res) => {
  try {
    await Post.update(req.body, {
      where: {
        id: req.params.id
      }
    });
    res.status(200).json({ message: 'Post updated successfully.' });
  } catch (err) {
    res.status(400).json(err);
  }
});
//Delete one of your own posts
router.delete('/:id/edit', withAuth, async (req, res) => {
  try {
    await Post.destroy({
      where: {
        id: req.params.id
      }
    });
    res.status(200).json({ message: 'Post successfully destroyed.' })
  } catch (err) {
    res.status(500).json(err);
  }
});
//Get all of your comments.
router.get('/comments', withAuth, async (req, res) => {
  try {
    const commentsData = await Comment.findAll({
      where: {
        explorer_id: req.session.userId
      }
    });

    const { username } = await Explorer.findByPk(req.session.userId, {
      attributes: ['username']
    });

    const comments = commentsData.map((comment) => comment.get({ plain: true }));

    for (const comment of comments) {
      comment.author = username;

      const postData = await Post.findByPk(comment.post_id, {
        include: [{
          model: Explorer,
          attributes: ['username']
        }]
      });
      comment.post_title = postData.title
      comment.post_author = postData.explorer.username;
    };

    res.render('comments-by-current-explorer', {
      comments,
      username,
      loggedIn: req.session.loggedIn,
      user_id: req.session.userId,
      background: imageData[Math.floor(Math.random() * 4)].file_path,
      stylesheet: '/css/style.css'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
//Get the view to edit comments
router.get('/comments/:id/edit', withAuth, async (req, res) => {
  try {

    const commentData = await Comment.findByPk(req.params.id);
    const comment = commentData.get({ plain: true });
    const { username } = await Explorer.findByPk(req.session.userId, {
      attributes:['username']
    });

    return res.render('edit', {
      ...comment, username,
      loggedIn: req.session.loggedIn,
      user_id: req.session.userId,
      background: imageData[Math.floor(Math.random() * 4)].file_path,
      stylesheet: '/css/style.css'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
//Update one of your comments
router.put('/comments/:id/edit', withAuth, async (req, res) => {
  try {
    await Comment.update(req.body, {
      where: {
        id: req.params.id
      }
    });

    res.status(200).json({ message: "Comment was successfully updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
//Delete one of your comments
router.delete('/comments/:id/edit', withAuth, async (req, res) => {
  try {
    await Comment.destroy({
      where: {
        id: req.params.id
      }
    });

    res.status(200).json({ message: "Comment successfully deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
module.exports = router;
