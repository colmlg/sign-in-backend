const Week = require('../models/week');
const moment = require('moment');
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
            date: moment($(startDateSelector, row).text(), "DD MMM YYYY").toDate(),
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
        weeks.forEach(updatedWeek => {
            Week.find({id: updatedWeek.id}).then(dbWeek => {
                dbWeek = dbWeek[0];
                dbWeek.date = updatedWeek.date;
                dbWeek.save();
            }).catch(() => {
                updatedWeek.save()
            })
        })
    }).catch(error => {
        console.log(error);
    })
}

exports.parse = parse;
exports.scrapeWeeks = scrapeWeeks;
exports.saveToDB = saveToDB;