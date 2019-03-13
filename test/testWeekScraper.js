const weekScraper = require('../scrapers/weekScraper');
const Week = require('../models/week');
require('mocha');
const assert = require('assert');


describe('WeekScraper', function () {
    describe('#saveToDB()', function () {
        it('should save the date of teaching weeks in our DB', function () {
            Week.remove({});


            return Week.find({}).then(weeks => {
                assert(weeks.length === 0);
            }).then(() => {
                return weekScraper.saveToDB();
            }).then(() => {
                return Week.find({});
            }).then(weeks => {
                assert(weeks.length === 13);
                return Promise.resolve();
            });
        });
    });
});
