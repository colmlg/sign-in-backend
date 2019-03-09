const rangeParser = require('parse-numeric-range');
const rp = require('request-promise-native');
const cheerio = require('cheerio');
const Lesson = require('../models/lesson');
const Week = require('../models/week');
const Module = require('../models/module');
const Room = require('../models/room');

const studentIdPattern = /^[0-9]{7,8}$/;
const entrySplitPattern = /\s*<.*?>(?:.*?<\/.*?>)?\s*(?:&#xA0;)?/;
const daySelector = 'body > div > table > tbody > tr:nth-child(2) > td';
const entrySelector = 'p > font > b';

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

//When we parse the information from the timetable we get a range of weeks.
//This function creates a seperate object for each lesson.
function createLessonForEachWeek(lesson, day) {
    const explodedLessons = [];
    for(let i =0; i < lesson.weeks.length; i++) {
        explodedLessons.push({
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            moduleId: lesson.moduleId,
            type: lesson.type,
            roomNumber: lesson.roomNumber,
            weekNumber: lesson.weeks[i],
            day: day,
        });
    }
    return explodedLessons;
}

function setDate(lesson) {
    return Week.find({id: lesson.weekNumber}).then(weeks => {
        const myDate = weeks[0].date;
        myDate.setDate(myDate.getDate() + lesson.day);
        lesson.date = myDate;
    });
}

function parse(studentId, $) {
    let lessons = [];
    $(daySelector).each((dayIndex, day) => {
        $(entrySelector, day).each((j, lessonElement) => {
            const parsedLesson = parseLesson($(lessonElement).html());
            const allLessons = createLessonForEachWeek(parsedLesson, dayIndex)
            Array.prototype.push.apply(lessons, allLessons);
        });
    });

    const moduleIds = new Set(lessons.map(lesson => {
        return lesson.moduleId;
    }));
    createModulesIfNotExists(moduleIds, studentId);

    const roomNumbers = new Set(lessons.map(lesson => {
        return lesson.roomNumber;
    }));
    saveRoom(roomNumbers);

    return Promise.all(lessons.map(lesson => {
        return setDate(lesson);
    })).then(() => {
        return lessons.map(lesson => {
            lesson._id = lesson.moduleId + '_' + lesson.type + "_" + lesson.startTime + "_" + lesson.date;
            return new Lesson(lesson);
        });
    });
}

function createModulesIfNotExists(moduleIds, studentId) {
    moduleIds.forEach(id => {
        Module.find({id: id}).then(modules => {
            let module;
            if(modules.length === 0) {
                module = new Module({
                    id: id,
                    students: []
                });
            } else {
                module = modules[0];
            }

            if (module.students.indexOf(studentId) === -1) {
                module.students.push(studentId);
            }

            module.save();
            console.log('Saving module ' + id);
        })
    })
}

function saveRoom(numbers) {
    numbers.forEach(roomNumber => {
        Room.find({roomNumber: roomNumber}).then(rooms => {
            if(rooms.length === 0) {
                const room = new Room({roomNumber: roomNumber});
                room.save();
                console.log('Created room ' + roomNumber);
            }
        })
    });
}

function scrapeTimetable(studentId) {
    const options = {
        uri: 'https://www.timetable.ul.ie/tt2.asp',
        form: {
            T1: studentId,
        },
    };
    return rp.post(options).then(cheerio.load).then($ => {
        return parse(studentId, $)
    });
}

exports.saveLessons = function (studentId) {
    scrapeTimetable(studentId).then(lessons => {
        return Promise.all(lessons.map(lesson => {
            return Lesson.find({_id: lesson._id }).then(lessons => {
                if(lessons.length === 0)
                    lesson.save();
            });
        }));
    }).then(() => {
        console.log('Scraped timetable for user ' + studentId);
    }).catch(error => {
        console.log('Error getting timetable for user ' + studentId);
        console.log(error);
    });
};

exports.scrapeTimetable = scrapeTimetable;