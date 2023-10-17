// Import the Sequelize models
const Explorer = require('./Explorer');
const Post = require('./Post');
const Comment = require('./Comment');
const Park = require('./Park');
const ExplorerPark = require('./ExplorerPark');

// Defining the one-to-many relation between the tables corresponding to Explorer (source) and Post (target)
Explorer.hasMany(Post, {
  foreignKey: 'explorer_id',
  onDelete: 'CASCADE'
});

Post.belongsTo(Explorer, {
  foreignKey: 'explorer_id',
});

//Defining the one-to-many relation between the Explorer and Comment models.
Explorer.hasMany(Comment, {
    foreignKey: 'explorer_id',
    unique: false,
    onDelete: 'CASCADE'
});

  
Comment.belongsTo(Explorer, {
    foreignKey: 'explorer_id',
    unique: false
});

//Defining the one-to-many relation between the tables corresponding to Post and Comment

Post.hasMany(Comment, {
    foreignKey: 'post_id',
    unique: false,
    onDelete: 'CASCADE'
});

Comment.belongsTo(Post, {
    foreignKey: 'post_id',
    unique: false
});

//Defining the many-to-many relation between Explorer and Park (the explorer can add parks as favorite, visited, and as a place to visit)

Explorer.belongsToMany(Park, {
  // Define the third table needed to store the foreign keys
  through: {
    model: ExplorerPark,
    unique: false
  },
  // Define an alias for when data is retrieved
  as: 'your_parks'
});

Park.belongsToMany(Explorer, {
  // Define the third table needed to store the foreign keys
  through: {
    model: ExplorerPark,
    unique: false
  },
  // Define an alias for when data is retrieved
  as: 'its_explorers'
});

module.exports = {
  Explorer,
  Post,
  Comment,
  Park,
  ExplorerPark
};
