const express = require('express');
const { validate } = require('express-validation');
const pitchController = require('../../controllers/pitch.controller');
const bookingValidation = require('../../validations/booking.validation');

const router = express.Router();

/**
 * @api {get} v1/pitches Get All Pitches
 * @apiDescription Get all available cricket pitches with pagination
 * @apiVersion 1.0.0
 * @apiName GetAllPitches
 * @apiGroup Pitch
 * @apiPermission public
 *
 * @apiParam  {Number{1..}}  [page=1]     Page number for pagination
 * @apiParam  {Number{1..50}} [limit=10]  Number of items per page
 *
 * @apiSuccess (OK 200) {Object[]}  pitches              Array of pitches
 * @apiSuccess (OK 200) {Number}    pitches[].id        Pitch ID
 * @apiSuccess (OK 200) {String}    pitches[].name      Pitch name
 * @apiSuccess (OK 200) {String}    pitches[].location  Pitch location
 * @apiSuccess (OK 200) {Number}    pitches[].pricePerHour  Hourly price
 * @apiSuccess (OK 200) {Date}      pitches[].createdAt Creation timestamp
 * @apiSuccess (OK 200) {Object}    pagination           Pagination info
 * @apiSuccess (OK 200) {Number}    pagination.page      Current page
 * @apiSuccess (OK 200) {Number}    pagination.limit      Items per page
 * @apiSuccess (OK 200) {Number}    pagination.total     Total number of pitches
 * @apiSuccess (OK 200) {Number}    pagination.pages      Total number of pages
 *
 * @apiError (Bad Request 400)  ValidationError  Invalid pagination parameters
 */
router.get('/', validate(bookingValidation.getPitches, {}, {}), pitchController.getAll);

module.exports = router;
