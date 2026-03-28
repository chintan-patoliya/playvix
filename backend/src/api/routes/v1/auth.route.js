const express = require('express');
const { validate } = require('express-validation');
const authController = require('../../controllers/auth.controller');
const authValidation = require('../../validations/auth.validation');
const { authorize } = require('../../middlewares/auth');

const router = express.Router();

/**
 * @api {post} v1/auth/register Register
 * @apiDescription Register a new user account
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String{2..100}}  name     User's full name
 * @apiParam  {String}         email    User's email address
 * @apiParam  {String{6..128}}  password User's password
 *
 * @apiSuccess (Created 201) {String}  token          JWT access token
 * @apiSuccess (Created 201) {Object}  user           User object
 * @apiSuccess (Created 201) {String}  user.id        User's ID
 * @apiSuccess (Created 201) {String}  user.name      User's name
 * @apiSuccess (Created 201) {String}  user.email     User's email
 * @apiSuccess (Created 201) {String}  user.role      User's role (user/admin)
 * @apiSuccess (Created 201) {Date}    user.createdAt Account creation timestamp
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Conflict 409)    EmailExists      Email already registered
 */
router.post('/register', validate(authValidation.register, {}, {}), authController.register);

/**
 * @api {post} v1/auth/login Login
 * @apiDescription Authenticate user and get access token
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String} email    User's email address
 * @apiParam  {String} password User's password
 *
 * @apiSuccess (OK 200) {String}  token          JWT access token
 * @apiSuccess (OK 200) {Object}  user           User object
 * @apiSuccess (OK 200) {String}  user.id        User's ID
 * @apiSuccess (OK 200) {String}  user.name      User's name
 * @apiSuccess (OK 200) {String}  user.email     User's email
 * @apiSuccess (OK 200) {String}  user.role      User's role (user/admin)
 * @apiSuccess (OK 200) {Date}    user.createdAt Account creation timestamp
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401) InvalidCredentials Invalid email or password
 */
router.post('/login', validate(authValidation.login, {}, {}), authController.login);

/**
 * @api {post} v1/auth/logout Logout
 * @apiDescription Logout user (clears token on client side)
 * @apiVersion 1.0.0
 * @apiName Logout
 * @apiGroup Auth
 * @apiPermission user, admin
 *
 * @apiHeader {String} Authorization   User's access token
 *
 * @apiSuccess (OK 200) {String}  message  Success message
 *
 * @apiError (Unauthorized 401)  Unauthorized  Invalid or missing token
 */
router.post('/logout', authorize('user', 'admin'), authController.logout);

/**
 * @api {get} v1/auth/me Get Current User
 * @apiDescription Get current authenticated user's profile
 * @apiVersion 1.0.0
 * @apiName GetCurrentUser
 * @apiGroup Auth
 * @apiPermission user, admin
 *
 * @apiHeader {String} Authorization   User's access token
 *
 * @apiSuccess (OK 200) {Object}  user           User object
 * @apiSuccess (OK 200) {String}  user.id        User's ID
 * @apiSuccess (OK 200) {String}  user.name      User's name
 * @apiSuccess (OK 200) {String}  user.email     User's email
 * @apiSuccess (OK 200) {String}  user.role      User's role (user/admin)
 * @apiSuccess (OK 200) {Date}    user.createdAt Account creation timestamp
 *
 * @apiError (Unauthorized 401)  Unauthorized  Invalid or missing token
 */
router.get('/me', authorize('user', 'admin'), authController.me);

module.exports = router;
