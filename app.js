const express = require('express')
const app = express()
const server = require('http').createServer(app)
const git = require('./git')
const sseSocket = require('./ssesocket')
const linecount = require('./linecount');

server.listen(process.env.PORT || 8080);

app.use(express.static(__dirname + '/public'));

app.get('/:user/:repo', function(req, res) {
  res.sendfile(__dirname + '/linecount.html');
});

app.get('/:user/:repo/*', function(req, res) {
  var socket = new sseSocket(req, res);
  git.cloneRepo(req.params.user, req.params.repo, socket, linecount.countLinesBuilder);
});