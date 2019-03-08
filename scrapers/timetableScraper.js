const rangeParser = require('parse-numeric-range');
const rp = require('request-promise-native');
const cheerio = require('cheerio');
const Lesson = require('../models/lesson');

const studentIdPattern = /^[0-9]{7,8}$/;
const entrySplitPattern = /\s*<.*?>(?:.*?<\/.*?>)?\s*(?:&#xA0;)?/;
const daySelector = 'body > div > table > tbody > tr:nth-child(2) > td';
const entrySelector = 'p > font > b';

function validateStudentId(studentId) {
    return studentIdPattern.test(studentId);
}

function parseLesson(element) {
    const parts = element.trim().split(entrySplitPattern);
    return {
        startTime: parts[0],
        endTime: parts[1],
        moduleId: parts[2],
        type: parts[3],
        roomNumber: parts[5].split(/\s+/)[0], //Let's just take the first room for now
        weeks: rangeParser.parse(parts[6].substring(4)),
    };
}

function parse(studentId, $) {
    let lessons = [];
    $(daySelector).each((i, day) => {
        lessons[i] = [];
        $(entrySelector, day).each((j, lessonElement) => {
            lessons[i][j] = parseLesson($(lessonElement).html());
        });
    });

    lessons = lessons.flat(1);
    const mappedLessons = [];
    lessons.forEach(lesson => {
        lesson.weeks.forEach(week => {
            mappedLessons.push(new Lesson({
                startTime: lesson.startTime,
                endTime: lesson.endTime,
                moduleId: lesson.moduleId,
                type: lesson.type,
                roomNumber: lesson.roomNumber,
                week: week,
            }));
        });
    });

    //Create new object for each week
    //For that object create new ID
    //

    mappedLessons.map(lesson => {
        lesson._id = lesson.moduleId + '_' + lesson.type + "_" + lesson.startTime + "_" + lesson.week;
    });

    return mappedLessons;
}

function scrapeTimetable(studentId) {
    const options = {
        uri: 'https://www.timetable.ul.ie/tt2.asp',
        form: {
            T1: studentId,
        },
    };
    return rp.post(options).then(cheerio.load).then($ => parse(studentId, $));
}


exports.scrapeTimetable = scrapeTimetable;