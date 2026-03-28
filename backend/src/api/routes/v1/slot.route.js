const express = require('express');
const { validate } = require('express-validation');
const slotController = require('../../controllers/slot.controller');
const bookingValidation = require('../../validations/booking.validation');

const router = express.Router();

/**
 * @api {get} v1/slots Get Slots
 * @apiDescription Get available time slots for a specific pitch on a specific date
 * @apiVersion 1.0.0
 * @apiName GetSlots
 * @apiGroup Slot
 * @apiPermission public
 *
 * @apiParam  {Number}  pitchId      Pitch ID (required)
 * @apiParam  {String}  date         Date in YYYY-MM-DD format (required)
 *
 * @apiSuccess (OK 200) {Object[]}  slots              Array of slots
 * @apiSuccess (OK 200) {Number}    slots[].id         Slot ID
 * @apiSuccess (OK 200) {Number}    slots[].pitchId    Pitch ID
 * @apiSuccess (OK 200) {String}    slots[].startTime  Start time (HH:mm format)
 * @apiSuccess (OK 200) {String}    slots[].endTime    End time (HH:mm format)
 * @apiSuccess (OK 200) {String}    slots[].status     Slot status (available/reserved/booked)
 *
 * @apiError (Bad Request 400)  ValidationError  Invalid parameters
 * @apiError (Bad Request 400)  InvalidDate     Date must be in YYYY-MM-DD format
 * @apiError (Bad Request 400)  PastDate        Date cannot be in the past
 */
router.get('/', validate(bookingValidation.getSlots, {}, {}), slotController.getSlots);

module.exports = router;
