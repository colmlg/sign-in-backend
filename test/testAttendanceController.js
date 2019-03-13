const Lesson = require('../models/lesson');
require('mocha');
const moment = require('moment');
const assert = require('assert');

const rewire = require('rewire');
const attendanceController = rewire('../controllers/attendanceController');

const isLessonCurrentlyOn = attendanceController.__get__('isLessonCurrentlyOn');

describe('AttendanceController', function () {
    describe('#isLessonCurrentlyOn()', function () {
        it('Checks that a lesson occurring right now returns true.', function (done) {

            const nowLesson = new Lesson({
                moduleId: 'Test ID',
                startTime: moment().format('HH:mm'),
                endTime: moment().add(1, 'hours').format('HH:mm'),
                date: new Date(),
                roomNumber: 'Test Room',
                studentsAttended: [],
                _id: 'Test ID'
            });

            assert(isLessonCurrentlyOn(nowLesson) === true);
            done();
        });

        it('Checks that a lesson occurring in the future returns false.', function (done) {

            //A lesson that starts one hour from now
            const futureLesson = new Lesson({
                moduleId: 'Test ID',
                startTime: moment().add(1, 'hours').format('HH:mm'),
                endTime: moment().add(3, 'hours').format('HH:mm'),
                date: new Date(),
                roomNumber: 'Test Room',
                studentsAttended: [],
                _id: 'Test ID_2'
            });

            assert(isLessonCurrentlyOn(futureLesson) === false);
            done();
        });

        it('Checks that a lesson occurring in the past returns false.', function (done) {
            //A lesson that ended one hour ago
            const pastLesson = new Lesson({
                moduleId: 'Test ID',
                startTime: moment().subtract(2, 'hours').format('HH:mm'),
                endTime: moment().subtract(1, 'hours').format('HH:mm'),
                date: new Date(),
                roomNumber: 'Test Room',
                studentsAttended: [],
                _id: 'Test ID_2'
            });

            assert(isLessonCurrentlyOn(pastLesson) === false);
            done();
        });

        it('Checks that a lesson occurring yesterday at the same time returns false.', function (done) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const nowLesson = new Lesson({
                moduleId: 'Test ID',
                startTime: moment().format('HH:mm'),
                endTime: moment().add(1, 'hours').format('HH:mm'),
                date: yesterday,
                roomNumber: 'Test Room',
                studentsAttended: [],
                _id: 'Test ID'
            });

            assert(isLessonCurrentlyOn(nowLesson) === false);
            done();
        });

        it('Checks that a lesson occurring tomorrow at the same time returns false.', function (done) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const nowLesson = new Lesson({
                moduleId: 'Test ID',
                startTime: moment().format('HH:mm'),
                endTime: moment().add(1, 'hours').format('HH:mm'),
                date: tomorrow,
                roomNumber: 'Test Room',
                studentsAttended: [],
                _id: 'Test ID'
            });

            assert(isLessonCurrentlyOn(nowLesson) === false);
            done();
        });
    });
});