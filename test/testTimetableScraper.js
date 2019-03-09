const timetableScraper = require('../scrapers/timetableScraper');
const Week = require('../models/week');
const Lesson = require('../models/lesson');
require('mocha');
const assert = require('assert');

describe('TimetableScraper', function () {
    describe('#scrapeTimetable()', function () {
        it('should save the date of teaching weeks in our DB', function () {
            this.timeout(1000000);
            return timetableScraper.scrapeTimetable("15148823").then(lessons => {
                cosole.log(lessons);
                return Promise.resolve();
            })
        });
    });
});
