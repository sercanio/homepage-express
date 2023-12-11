const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  slug: { type: String, required: true },
  tags: {type: Array, required: true},
  content: { type: String, required: true },
});

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;
