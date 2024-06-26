const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const he = require('he');
const { format } = require('date-fns');
const passport = require('../user-authentication/passport-config');
const User = require('../models/user');
const Message = require('../models/message');
require('dotenv').config();

exports.error_get = asyncHandler(async (req, res, next) => {
  const errorMessage = req.query.message;
  res.render('error', { error: errorMessage });
});

exports.home_page_get = asyncHandler(async (req, res, next) => {
  const messages = await Message.find().sort({ timestamp: -1 }).exec();
  const formattedMessages = messages.map((message) => ({
    ...message.toObject(),
    timestamp: format(new Date(message.timestamp), 'EEEE dd MMMM yyyy HH:mm'),
  }));

  res.render('index', { messages: formattedMessages });
});

exports.home_page_post = [

  body('title', 'Title must not be empty.').trim().isLength({ min: 1, max: 30 }).escape(),
  body('message', 'Message must not be empty.').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsMessages = errors.array().map((error) => error.msg);
      res.render('error', { error: errorsMessages });
    } else {
      try {
        const message = new Message({
          userId: req.user.id,
          author: req.user.username,
          title: he.decode(req.body.title),
          timestamp: new Date(),
          text: he.decode(req.body.message),
        });
        await message.save();
        res.redirect('/');
      } catch (error) {
        console.error('An error occurred while processing the request:', error);
        res.status(500).send('An error occurred while processing the request.');
      }
    }
  }),
];

exports.sign_up_form_get = asyncHandler(async (req, res, next) => {
  res.render('sign_up_form');
});

exports.sign_up_form_post = [

  body('first-name', 'First Name must not be empty.').trim().isLength({ min: 1, max: 30 }).escape(),
  body('last-name', 'Last Name must not be empty.').trim().isLength({ min: 1, max: 30 }).escape(),
  body('username', 'Username must not be empty.').trim().isLength({ min: 1, max: 100 }).escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value }).exec();
      if (user) {
        throw new Error('Username already in use');
      }
    }),
  body('password', 'Password must not be empty.').trim().isLength({ min: 8, max: 16 }).escape(),
  body('confirm-password', 'Confirm Password must not be empty.').custom((value, { req }) => value === req.body.password)
    .withMessage('Password does not match'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsMessages = errors.array().map((error) => error.msg);
      res.render('error', { error: errorsMessages });
    } else {
      try {
        const user = new User({
          name: {
            firstName: he.decode(req.body['first-name']),
            lastName: he.decode(req.body['last-name']),
          },
          username: he.decode(req.body.username),
          password: he.decode(req.body.password),
          memberStatus: false,
        });

        user.password = await bcrypt.hash(user.password, 10);

        await user.save();
        res.redirect('/sign-in');
      } catch (error) {
        console.error('An error occurred while processing the request:', error);
        res.status(500).send('An error occurred while processing the request.');
      }
    }
  }),
];

exports.sign_in_form_get = asyncHandler(async (req, res, next) => {
  res.render('sign_in_form');
});

exports.sign_in_form_post = passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/error',
});

exports.log_out_get = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

exports.dashboard_get = asyncHandler(async (req, res, next) => {
  const userMessages = await Message.find({ userId: req.user.id }).sort({ timestamp: -1 }).exec();
  const formattedMessages = userMessages.map((message) => ({
    ...message.toObject(),
    timestamp: format(new Date(message.timestamp), 'EEEE dd MMMM yyyy HH:mm'),
  }));
  res.render('dashboard', { userMessages: formattedMessages });
});

exports.dashboard_post = [

  body('title', 'Title must not be empty.').trim().isLength({ min: 1, max: 30 }).escape(),
  body('message', 'Message must not be empty.').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsMessages = errors.array().map((error) => error.msg);
      res.render('error', { error: errorsMessages });
    } else {
      try {
        const message = new Message({
          userId: req.user.id,
          author: req.user.username,
          title: he.decode(req.body.title),
          timestamp: new Date(),
          text: he.decode(req.body.message),
        });
        await message.save();
        res.redirect('/dashboard');
      } catch (error) {
        console.error('An error occurred while processing the request:', error);
        res.status(500).send('An error occurred while processing the request.');
      }
    }
  }),
];

exports.delete_message_get = asyncHandler(async (req, res, next) => {
  const { fromPage } = req.query;

  await Message.findByIdAndDelete(req.params.messageId);

  if (fromPage === 'dashboard') {
    res.redirect('/dashboard');
  } else {
    res.redirect('/');
  }
});

exports.membership_form_get = asyncHandler(async (req, res, next) => {
  res.render('membership_form');
});

exports.membership_form_post = [
  body('secret-passcode').trim().escape(),
  asyncHandler(async (req, res, next) => {
    const secretPasscode = req.body['secret-passcode'].toLowerCase();
    if (secretPasscode === process.env.SECRET_PASSCODE) {
      await User.findOneAndUpdate({ _id: req.user.id }, { memberStatus: true }).exec();
      res.redirect('/dashboard');
    } else {
      res.redirect('/error?message=Wrong%20Passcode');
    }
  }),
];
exports.become_admin_form_get = asyncHandler(async (req, res, next) => {
  res.render('become_admin_form');
});

exports.become_admin_form_post = [
  body('become-admin-secret-passcode').trim().escape(),
  asyncHandler(async (req, res, next) => {
    const adminSecretPasscode = req.body['become-admin-secret-passcode'];
    if (adminSecretPasscode === process.env.ADMIN_PASSCODE) {
      await User.findOneAndUpdate({ _id: req.user.id }, { isAdmin: true }).exec();
      res.redirect('/dashboard');
    } else {
      res.redirect('/error?message=Wrong%20Passcode');
    }
  }),
];
