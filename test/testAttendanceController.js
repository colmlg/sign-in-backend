const attendanceController = require('../controllers/attendanceController');
const Lesson = require('../models/lesson');
require('mocha');
const moment = require('moment');
const assert = require('assert');

describe('AttedanceController', function () {
    describe('#isEventCurrentlyOn()', function () {
        it('Checks if the event is occurring right now', function () {
            const event = {
                startTime: moment().format('hh:mm'),
                endTime: moment().format('hh:mm') + 1,
                week: 9;


            }

        });
    });
});