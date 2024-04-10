const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    firstName: {
      type: String, minLength: 1, maxLength: 30, required: true,
    },
    lastName: {
      type: String, minLength: 1, maxLength: 30, required: true,
    },
  },
  username: {
    type: String, minLength: 1, maxLength: 100, required: true,
  },
  password: {
    type: String, required: true,
  },
  memberStatus: { type: Boolean },
});

UserSchema.virtual('url').get(function () {
  return `/index/user/${this._id}`;
});

module.exports = mongoose.model('User', UserSchema);
