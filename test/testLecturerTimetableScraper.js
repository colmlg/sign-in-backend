require('mocha');
const assert = require('assert');

const rewire = require('rewire');
const lecturerTimetableScraper = rewire('../scrapers/lecturerTimetableScraper');

const scrapeTimetable = lecturerTimetableScraper.__get__('scrapeTimetable');

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
        });
    });
});