const moment = require("moment");

require('mocha');
const assert = require('assert');

const rewire = require('rewire');
const timetableScraper = rewire('../scrapers/timetableScraper');

const scrapeTimetable = timetableScraper.__get__('scrapeTimetable');
const setLessonDate = timetableScraper.__get__('setLessonDate');

function ensureFlag(flags, flag) {
    return flags.includes(flag) ? flags : flags + flag;
}
function* matchAll(str, regex) {
    const localCopy = new RegExp(
        regex, ensureFlag(regex.flags, 'g'));
    let match;
    while (match = localCopy.exec(str)) {
        yield match;
    }
}


describe('LecturerTimetableScraper', function () {
    describe('#scrapeTimetable()', function () {
        it('Scrapes the lecturers timetable', function (done) {
            scrapeTimetable('heapat1').then(lessons => {
                assert(lessons.length === 16);
                done();
            });
        });
    });

    describe('#testRegex()', function () {
        it('test regex', function (done) {
            const regex = new RegExp(/[A-Z]+\d+/);
            const testString = 'CS5722CS4227';
            for (const match of matchAll(testString, regex)) {
                console.log(match[0]);
            }
            done();
        });
    });

    describe('#testSetLessonDate()', function () {
        it('sets the correct date', function (done) {
            const weekDateString = '18 Mar 2019'; //Monday
            const weekDate = moment(weekDateString, "DD MMM YYYY").toDate();

            const week = {
                id: 9,
                date: weekDate
            };

            const lesson = {
                startTime: '12:00',
                day: 2, //0-indexed from Monday
                date: null
            };

            setLessonDate(lesson, week);

            const expectedDate = moment('20 Mar 2019 12:00', "DD MMM YYYY HH:mm").toDate();
            assert(expectedDate.toString() === lesson.date.toString());
            done();
        });
    });
});