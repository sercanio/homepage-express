const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  slug: { type: String, required: true },
  tags: { type: Array, required: true },
  content: { type: String, required: true },
  hasCode: { type: Boolean, required: true},
  isVisible: { type: Boolean, required: true, default: false },
});

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;
