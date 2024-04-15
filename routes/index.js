const express = require('express');

const router = express.Router();

const user_controller = require('../controllers/userController');

router.get('/', user_controller.home_page_get);

router.post('/', user_controller.home_page_post);

router.get('/membership', user_controller.membership_form_get);

router.post('/membership', user_controller.membership_form_post);

router.get('/sign-in', user_controller.sign_in_form_get);

router.post('/sign-in', user_controller.sign_in_form_post);

router.get('/sign-up', user_controller.sign_up_form_get);

router.post('/sign-up', user_controller.sign_up_form_post);

router.get('/dashboard', user_controller.dashboard_get);

router.post('/dashboard', user_controller.dashboard_post);

router.get('/log-out', user_controller.log_out_get);

router.get('/delete-message/:messageId', user_controller.delete_message_get);

module.exports = router;
