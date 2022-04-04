const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authenticationController');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
router.patch('/updateUser', authController.protect, userController.updateMe);
router.delete('/deleteUser', authController.protect, userController.deleteMe);

router.delete('/deleteAllUsers', userController.deleteAllUsers);

router.route('/').get(userController.getUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
