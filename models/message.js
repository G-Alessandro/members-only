const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  userId: { type: Schema.Types.Mixed },
  title: {
    type: String, minLength: 1, maxLength: 30, required: true,
  },
  timestamp: {
    Date,
  },
  text: { type: String, minLength: 1, required: true },
});

MessageSchema.virtual('url').get(function () {
  return `/index/user/${this._id}`;
});

module.exports = mongoose.model('User', MessageSchema);
