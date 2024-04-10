const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  userId: { type: Schema.Types.Mixed },
  title: {
    type: String, minLength: 1, maxLength: 30, required: true,
  },
  timestamp: {
    type: String,
  },
  text: { type: String, minLength: 1, required: true },
});

MessageSchema.virtual('url').get(function () {
  return `/index/message/${this._id}`;
});

module.exports = mongoose.model('Message', MessageSchema);
