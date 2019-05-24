const http = require('http');
const server = http.createServer();
const express = require('express');
const package = require('../package.json');

//express
const app = express();
const webRoot = __dirname + '/webroot';
app.use(express.static(webRoot));

//web server
app.get('/config', function (req, res) {
	res.status(200).send(`
		window.backendHost='${process.env.backendHost || 'http://localhost'}';
		window.backendPort='${process.env.backendPort || '3031'}';
		window.frontendVersion='${package.version}';
	`);
});

app.get('*', function (req, res) {
	const headers = req.headers;
	if (String(headers.accept).indexOf("text/html") !== -1) {
		res.sendFile(webRoot + '/index.html');
	}
	else {
		res.status(404).send("Not found");
	}
});

const errorHandler = (err) => {
	console.error(err);
};
server.on('request', app);
server.on('error', errorHandler);
server.listen(process.env.frontendPort || 3030, () => {
	console.log('Listening on ' + server.address().port);
});