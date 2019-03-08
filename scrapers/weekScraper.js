const Week = require('../models/week');
const rp = require('request-promise-native');
const cheerio = require('cheerio');
const weekSelector = 'body > table > tbody > tr';
const startDateSelector = 'td:nth-child(1)';
const teachingWeekSelector = 'td:nth-child(2)';

function parse($) {
    const weeks = [];
    $(weekSelector).slice(1).each((i, row) => {
        weeks[i] = new Week({
            id: $(teachingWeekSelector, row).text(),
            date: new Date($(startDateSelector, row).text()),
        });
    });
    return weeks;
}

function scrapeWeeks() {
    const options = {
        uri: 'http://www.timetable.ul.ie/weeks.htm'
    };
    return rp.get(options).then(cheerio.load).then(parse)
}

function saveToDB() {
    return scrapeWeeks().then(weeks => {
        return Promise.all(weeks.map(week => {
            week.save();
        }))
    }).catch(error => {
        console.log(error);
    })
}

exports.parse = parse;
exports.scrapeWeeks = scrapeWeeks;
exports.saveToDB = saveToDB;