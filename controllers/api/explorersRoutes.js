const router = require('express').Router();
const withAuth = require('../../utils/auth');
const imageData = require('../../seeds/imageData');
const { Explorer, Post, Comment } = require('../../models');
const { Op } = require('sequelize');

//Get all posts by all explorers
router.get('/posts', withAuth, async (req, res) => {
    try {
        const postData = await Post.findAll({
            include: [
                {
                    model: Explorer,
                    attributes: ['username'],
                },
                { model: Comment }
            ],
        });
        const posts = postData.map((post) => post.get({ plain: true }));
        posts.forEach((post) => {
            post.isOwnPost = post.explorer_id === req.session.userId;
            post.author = post.explorer.username;
        });

        const { username } = await Explorer.findByPk(req.session.userId);

        res.render('all-posts', {
            posts,
            loggedIn: req.session.loggedIn,
            username,
            user_id: req.session.userId,
            background: imageData[0].file_path,
            stylesheet: "/css/style.css"
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

//Get one post together with all of the comments on it
router.get('/posts/:id', withAuth, async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id, {
            include: [Comment]
        });

        if (!postData) res.status(404).json({ message: "No post found with that id." });

        const post = postData.get({ plain: true });
        const authorData = await Explorer.findByPk(postData.explorer_id);
        const author_name = post.author = authorData.username;

        for (const comment of post.comments) {
            const authorData = await Explorer.findByPk(comment.explorer_id);
            const author = authorData.username;
            comment.author = author;
            comment.post_title = post.title;
            comment.post_author = author_name;
        }
        const { username } = await Explorer.findByPk(req.session.userId);
        console.log(username);
        res.render('comments-for-one-post', {
            ...post,
            author_name,
            username,
            loggedIn: req.session.loggedIn,
            user_id: req.session.userId,
            background: imageData[Math.floor(Math.random() * 4)].file_path,
            stylesheet: '/css/style.css'
        });
    } catch (err) {
        res.status(500).json(err); 1
    }
});

//Render the view to add a comment to a given post
router.get('/posts/:id/comment', withAuth, async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id);
        const post = postData.get({ plain: true });
        const authorData = await Explorer.findByPk(post.explorer_id);
        const author_name = authorData.username;
        const { username } = await Explorer.findByPk(req.session.userId);

        res.render('add-comment', {
            ...post,
            author_name,
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
//Add a comment to a particular post.
router.post('/posts/:id/comment', withAuth, async (req, res) => {
    try {

        const newComment = await Comment.create({
            ...req.body,
            explorer_id: req.session.userId
        });
        res.status(201).json(newComment);

    } catch (err) {
        res.status(400).json(err);
    }
});

//Get all other explorers to search for their posts and comments
router.get('/search', withAuth, async (req, res) => {
    try {
        const allExplorersData = await Explorer.findAll({
            where: {
                id: {
                    [Op.ne]: req.session.userId
                }
            },
            attributes: {
                exclude: ['password']
            }
        });
        const allExplorers = allExplorersData.map((explorer) => explorer.get({ plain: true }));
        const { username } = await Explorer.findByPk(req.session.userId);
        const length = allExplorers.length;

        res.render('all-explorers', {
            allExplorers,
            username,
            loggedIn: req.session.loggedIn,
            user_id: req.session.userId,
            length,
            background: imageData[Math.floor(Math.random() * 4)].file_path,
            stylesheet: '/css/style.css'
        }
        );
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
//Get all posts by a selected explorer with the option to add a comment or view all of its comments.
router.get('/search/:id/posts', withAuth, async (req, res) => {
    try {
        const allPostsData = await Post.findAll({
            where: {
                explorer_id: req.params.id
            }
        });

        const explorerData = await Explorer.findByPk(req.params.id);
        const explorer = explorerData.username;
        const { username } = await Explorer.findByPk(req.session.userId, {
            attributes: ['username']
        });

        const allPosts = allPostsData.map((post) => post.get({ plain: true }));

        allPosts.forEach((post) => {
            post.author = explorer;
            post.isOwnPost = (req.params.id == req.session.userId);
        });

        res.render('all-posts-by-an-explorer', {
            username, explorer, allPosts,
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

router.get('/search/:id/comments', withAuth, async (req, res) => {
    try {
        const commentsData = await Comment.findAll({
            where: {
                explorer_id: req.params.id
            }
        });

        const explorerData = await Explorer.findByPk(req.params.id);
        const explorer = explorerData.username;
        const { username } = await Explorer.findByPk(req.session.userId, {
            attributes: ['username']
        });

        const comments = commentsData.map((comment) => comment.get({ plain: true }));

        for (const comment of comments) {
            comment.author = explorer;

            const postData = await Post.findByPk(comment.post_id, {
                include: [{
                    model: Explorer,
                    attributes: ['username']
                }]
            });
            comment.post_title = postData.title
            comment.post_author = postData.explorer.username;
        };
        res.render('all-comments-by-an-explorer', {
            comments, username, explorer,
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
module.exports = router;