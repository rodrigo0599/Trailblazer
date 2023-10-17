const router = require('express').Router();
const homeRoutes = require('./homeRoutes');
const apiRoutes = require('./api');
const accessRoutes = require('./accessRoutes');
const imageData = require('../seeds/imageData');

router.use('/', homeRoutes);
router.use('/access', accessRoutes);
router.use('/api', apiRoutes);

//Wildcard route: displays custom 404 page.
router.get('*', async (req, res) => {

    res.render('not-found', { 
        loggedIn: req.session.loggedIn,
        background: imageData[0].file_path, stylesheet: "/css/style.css", not_found: true });
});

module.exports = router;