const userController = require('./userController');
const articleController = require('./articleController');
const commentController = require('./commentController');
const categoryController = require('./categoryController');
const tagController = require('./tagController');

module.exports = {
  ...userController,
  ...articleController,
  ...commentController,
  ...categoryController,
  ...tagController
};