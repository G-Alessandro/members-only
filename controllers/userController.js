const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const he = require('he');
const passport = require('../user-authentication/passport-config');
const User = require('../models/user');

exports.membership_get = asyncHandler(async (req, res, next) => {
  res.render('membership_form');
});

exports.sign_up_form_get = asyncHandler(async (req, res, next) => {
  res.render('sign_up_form');
});

exports.sign_up_form_post = [

  body('first-name', 'First Name must not be empty.').trim().isLength({ min: 1, max: 30 }).escape(),
  body('last-name', 'Last Name must not be empty.').trim().isLength({ min: 1, max: 30 }).escape(),
  body('username', 'Username must not be empty.').trim().isLength({ min: 1, max: 100 }).escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
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
        res.redirect('/');
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

// exports.sign_in_form_get = asyncHandler(async (req, res, next) => {
//   res.render('sign_in_form', { user: req.user });
// });

exports.sign_in_form_post = passport.authenticate('local', {
  successRedirect: '/sign-in',
  failureRedirect: '/',
});

exports.log_out_get = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});
