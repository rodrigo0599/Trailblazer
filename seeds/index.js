const sequelize = require('../config/connection');
const { Explorer, Post, Comment, ExplorerPark, Park } = require('../models');

const explorerData = require('./explorerData.json');
const postData = require('./postData.json');
const commentData = require('./commentData.json');
const parkData = require('./parkData.json');
const explorerParkData = require('./explorerParkData.json');

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  await Explorer.bulkCreate(explorerData, {
    individualHooks: true,
    returning: true
  });

  await Post.bulkCreate(postData, {returning: true});

  await Comment.bulkCreate(commentData, {returning:true});

  await Park.bulkCreate(parkData, {returning: true});

  await ExplorerPark.bulkCreate(explorerParkData, {returning: true});

  process.exit(0);
};

seedDatabase();