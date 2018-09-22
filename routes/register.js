var express = require('express');
var router = express.Router();

router.post('/student', function(req, res) {
    var db = req.db;

    db.collection('students').insert(req.body, function (error) {
        if (!error) {
            res.send("Registered Successfully");
        } else {
            res.statusCode = 400;
            res.send("Student already registered.")
        }
    });
});


module.exports = router;