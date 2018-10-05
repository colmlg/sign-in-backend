var Module = require('../models/module');
var moment = require('moment');
require('moment-recur');

exports.addModule = function(req, res) {
    Module.create(req.body, function(error, module) {
        if (error) {
            return res.status(500).json(error);
        }
        res.status(200).send(module);
    });
};

exports.getModule = function(req, res) {

    Module.findOne({ id: req.query.id }, function (error, module) {
        if (error || !module) {
            return res.status(500).json(error);
        }

        if (module.lecturers.indexOf(req.userId) === -1) {
            return res.status(403).send({ error: 'You are not a lecturer of this module.'});
        }
        res.status(200).json(module)
    });
};

exports.isModuleActive = function(req, res) {
  Module.findOne({ id: req.body.id }, function (error, module) {
      if (error) {
          return res.status(500).json(error);
      }

      if(!module) {
          return res.status(404).send();
      }

      for(var i = 0; i < module.events.length; i++) {

          var recurrence = moment().recur({
              start: module.events[i].startDate,
              end: module.events[i].startDate
          }).every(1).weeks();

          if(recurrence.matches(req.body.date)) {
              return res.status(200).json({ occurring: true });
          }
      }

      return res.status(200).json({ occurring: false });

  });
};