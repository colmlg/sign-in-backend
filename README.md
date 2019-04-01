# sign-in-backend
This is the backend portion of my final year project, a system for taking attendance at lectures.
It is a REST API written in JavaScript using Node.js.
It uses MongoDB for the database with the Mongoose library.

## To run:
Make sure you have a MongoDB database running locally, start it with:
```
mongod
```

You will also need to set up some environment variables, which can be placed in a `.env` file in the project root directory.
An example `.env` is shown below:
```
TOKEN_SECRET=############
AZURE_KEY=############
```
TOKEN_SECRET is the secret used for signing tokens.
AZURE_KEY is the [Microsft Azure Face API key](https://azure.microsoft.com/en-us/services/cognitive-services/face/) used for facial recognition.


Once these are set up, run the backend using:
```
npm install
npm start
```

and the backend will start runnning on http://localhost:3000
