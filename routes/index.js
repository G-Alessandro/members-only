const express = require('express');

const router = express.Router();

const user_controller = require('../controllers/userController');

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/membership', user_controller.membership_get);

router.get('/sign-in', user_controller.sign_in_form_get);

router.post('/sign-in', user_controller.sign_in_form_post);

router.get('/sign-up', user_controller.sign_up_form_get);

router.post('/sign-up', user_controller.sign_up_form_post);

router.get('/log-out', user_controller.log_out_get);

module.exports = router;
