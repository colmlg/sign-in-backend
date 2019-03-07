const request = require('request');
const constants = require('../constants');

exports.compareFaces = function (referenceImage, imageToCompare) {
    const decodedImage = Buffer.from(imageToCompare, 'base64');

    return Promise.all([getFaceId(referenceImage), getFaceId(decodedImage)]).then(faceIds => {
        return compareFaces(faceIds[0], faceIds[1]);
    }).then(response => {
        return response.isIdentical;
    })
};


exports.getFaceId = function getFaceId(image) {
    const params = {
        'returnFaceId': 'true',
        'returnFaceLandmarks': 'false'
    };

    const options = {
        uri: constants.AZURE_BASE_URL + 'detect',
        qs: params,
        body: image,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': process.env.AZURE_KEY
        }
    };

    return new Promise(function (resolve, reject) {
        request.post(options, function (error, response, body) {
            if (error) return reject(error);

            body = JSON.parse(body);

            if (body[0] === undefined) {
                return reject({error: 'No Faces Detected'});
            }

            //The array of faces returned from Azure is sorted in descending order on rectangle size.
            //We are only interested in the first face, as this is the largest and most likely
            //to belong to the user.
            resolve(body[0].faceId);
        });

    });
}

function compareFaces(faceId1, faceId2) {

    const body = {
        faceId1: faceId1,
        faceId2: faceId2
    };

    const options = {
        uri: constants.AZURE_BASE_URL + 'verify',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.AZURE_KEY
        }
    };

    return new Promise(function (resolve, reject) {
        request.post(options, function (error, response, body) {
            if (error) return reject(error);

            body = JSON.parse(body);
            resolve(body);
        });
    });
}