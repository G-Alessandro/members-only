const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  userId: { type: Schema.Types.Mixed },
  author: {
    type: String,
  },
  title: {
    type: String, minLength: 1, maxLength: 30, required: true,
  },
  timestamp: {
    type: Date,
  },
  text: { type: String, minLength: 1, required: true },
});

module.exports = mongoose.model('Message', MessageSchema);
