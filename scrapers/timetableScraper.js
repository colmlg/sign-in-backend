const rangeParser = require('parse-numeric-range');
const rp = require('request-promise-native');
const Lesson = require('../models/lesson');
const Week = require('../models/week');
const Module = require('../models/module');
const Room = require('../models/room');

let _isStaff;

exports.saveLessons = function (userId, isStaff) {
    return scrapeTimetable(userId, isStaff).then(lessons => {
        return Promise.all(lessons.map(lesson => {
            return Lesson.find({_id: lesson._id}).then(lessons => {
                if (lessons.length === 0)
                    lesson.save();
            });
        }));
    });
};


function scrapeTimetable(userId, isStaff) {
    _isStaff = isStaff;

    const options = {
        uri: 'http://35.189.65.75/id-timetable-v2.php/id/' + userId + '/staff/' + isStaff,
    };
    return rp.get(options).then(response => {
        const timetable = JSON.parse(response);
        return parse(timetable);
    });
}

exports.scrapeTimetable = scrapeTimetable;


function parse(timetable) {
    let lessons = [];

    timetable.classes.forEach(lesson => {
        const mappedLessons = mapLesson(lesson);
        mappedLessons.forEach(mappedLesson => {
            //When we get the result back from the API weeks is formatted like '1-12'.
            //we want a separate lesson object for each week
            const allLessons = createLessonForEachWeek(mappedLesson);
            Array.prototype.push.apply(lessons, allLessons);
        });
    });


    //Create a 'Module' object in the DB if it doesn't exist. Also adds the current user to that module.
    const moduleIds = new Set(lessons.map(lesson => {
        return lesson.moduleId;
    }));
    createModulesIfNotExists(moduleIds, timetable.id);

    //Create room objects if they dont exist.
    const roomNumbers = new Set(lessons.map(lesson => {
        return lesson.roomNumber;
    }));
    saveRoom(roomNumbers);

    return Promise.all(lessons.map(lesson => {
        //Set the date on the lesson objects. We would do this sooner but it returns a promise so this is cleaner.
        return setDate(lesson);
    })).then(() => {
        return lessons.map(lesson => {
            //Create a unique ID for these lesson objects.
            lesson._id = lesson.moduleId + '_' + lesson.type + "_" + lesson.startTime + "_" + lesson.date;
            return new Lesson(lesson);
        });
    });
}

/* Maps the lessons from this format to ours:
{
      "day": 1,
      "time": "09:00-10:00",
      "type": "CS4115-LAB-2A",
      "name": "Data Structures And Algorithms",
      "room": "CS3005B",
      "weeks": "1-12"
    }
 */

function mapLesson(lesson) {

    const type = lesson.type.split('-')[1];
    //Annoyingly, moduleID could be two or more module IDs stuck together
    const moduleIds = parseModuleId(lesson.type.split('-')[0]);

    return moduleIds.map(id => {
        return {
            startTime: lesson.time.split('-')[0],
            endTime: lesson.time.split('-')[1],
            moduleId: id,
            type: type === '' ? 'LEC' : type,
            roomNumber: lesson.room,
            weeks: rangeParser.parse(lesson.weeks),
            day: lesson.day - 1,
        }
    });
}

function parseModuleId(moduleId) {
    const regex = new RegExp(/[A-Z]+\d+/);
    const ids = [];
    for (const match of matchAll(moduleId, regex)) {
        ids.push(match[0]);
    }
    return ids;
}

//This function creates a separate object for each lesson.
function createLessonForEachWeek(lesson) {
    const explodedLessons = [];
    for (let i = 0; i < lesson.weeks.length; i++) {
        explodedLessons.push({
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            moduleId: lesson.moduleId,
            type: lesson.type,
            roomNumber: lesson.roomNumber,
            weekNumber: lesson.weeks[i],
            day: lesson.day,
        });
    }
    return explodedLessons;
}

function createModulesIfNotExists(moduleIds, userId) {
    moduleIds.forEach(id => {
        Module.find({id: id}).then(modules => {
            let module;
            if (modules.length === 0) {
                module = new Module({
                    id: id,
                    users: []
                });
            } else {
                module = modules[0];
            }

            if (_isStaff && module.lecturers.indexOf(userId) === -1) {
                module.lecturers.push(userId);
            } else if (!_isStaff && module.students.indexOf(userId) === -1) {
                module.students.push(userId);
            }

            module.save();
            console.log('Saved module ' + id);
        })
    })
}

function saveRoom(numbers) {
    numbers.forEach(roomNumber => {
        Room.find({roomNumber: roomNumber}).then(rooms => {
            if (rooms.length === 0) {
                const room = new Room({roomNumber: roomNumber});
                room.save();
                console.log('Created room ' + roomNumber);
            }
        })
    });
}

function setDate(lesson) {
    return Week.findOne({id: lesson.weekNumber}).then(week => {
        setLessonDate(lesson, week)
    });
}

function setLessonDate(lesson, week) {
    const myDate = week.date;
    const lessonTime = lesson.startTime.split(':');
    myDate.setDate(myDate.getDate() + lesson.day);
    myDate.setHours(lessonTime[0], lessonTime[1]);
    lesson.date = myDate;
}

//MARK: Regex functions for matchAll
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
