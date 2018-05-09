import express from 'express';
const app = express();
const http = require('http').Server(app);

import Datastore from 'nedb';
const rooms = new Datastore();
const io = require('./sockets').listen(http, rooms);

const port = 3000;
const DEBUG = true;

app.use(express.static(`${__dirname}/bower_components`));
app.use(express.static(`${__dirname}/dist/`));

app.locals.pretty = true;

app.get('/*:room?', (req, res) => {
  res.sendFile('dist/index.html', {root: __dirname});
});

http.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
