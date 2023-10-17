const router = require('express').Router();
const dashboardRoutes = require('./dashboardRoutes');
const explorersRoutes = require('./explorersRoutes');
const parkRoutes = require('./parkRoutes')

router.use('/dashboard', dashboardRoutes);
router.use('/explorers', explorersRoutes);
router.use('/parks', parkRoutes);

module.exports = router;
