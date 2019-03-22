const Constants = require('../constants');
const moment = require('moment');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Module = require('../models/module');
const Lesson = require('../models/lesson');
const Room = require('../models/room');


const num_modules = 5;
const num_students = 200;
const num_lessons = 20;

let _lecturer;
let _students;
let _modules;
let _lessons;
let _room;

exports.saveMockData = function () {
    return createMockUsers().then(() => createMockModules()).then(() => createMockRoom()).then(() => createMockLessons()).catch(error => {
        console.log('Error creating mock data.')
    })
};


function createMockUsers() {
    const lecturer = new User({
        id: "test_lecturer",
        role: Constants.LECTURER,
        password: bcrypt.hashSync('password', 8),
    });

    _lecturer = lecturer;



    let students = [];
    for (let i = 0; i < num_students; i++) {
        students.push({
            id: `12345${i}`,
            role: Constants.STUDENT,
            password: bcrypt.hashSync('password', 8),
        });
    }

    _students = students;

    return Promise.all([User.create(students), lecturer.save()]);
}

function createMockModules() {
    let modules = [];
    for (let i = 1; i <= num_modules; i++) {
        modules.push(new Module({
            id: `CS123${i}`,
            lecturers: [_lecturer.id],
            students: _students.map(s => s.id),
        }))
    }

    _modules = modules;

    return Module.create(modules);
}

function createMockRoom() {
    _room = new Room({
        roomNumber: "TE1234"
    });

    return Room.create(_room);
}

function createMockLessons() {
    let lessons = [];

    for (let i = 0; i < num_modules; i++) {
        for (let j = 0; j < num_lessons; j++) {
            let lesson = {
                type: j % 2 === 0 ? Constants.LECTURE : Constants.LAB,
                moduleId: _modules[i].id,
                startTime: "00:00",
                endTime: "23:59",
                date: moment().subtract(j * 3, 'days'),
                roomNumber: _room.roomNumber,
                studentsAttended: [],
                _id: `${_modules[i].id}_${j}`
            };


            _students.forEach(s => {
                const chance = Math.random();
                if (0.2 * i <= chance) {
                    lesson.studentsAttended.push(s.id);
                }
            });

            lessons.push(lesson)
        }
    }

    _lessons = lessons;

    return Lesson.create(lessons);
}