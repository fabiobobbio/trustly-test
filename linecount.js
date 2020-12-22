const os = require('os')
const fs = require('fs')
const parser = require('./parser');

function walkRepo(path, onFile) {
  if(fs.existsSync(path))  {
    fs.readdirSync(path).forEach(function(file,index){
      if (file.indexOf(".git") != 0) { 
        var curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) { 
          walkRepo(curPath, onFile);
        } else { 
          onFile(curPath);
        }
      }
    });
  }
}

function addResult(acc, newResult) {
  if (newResult) {
    if (acc.hasOwnProperty(newResult.filetype)) {
      acc[newResult.filetype].files += 1;
      acc[newResult.filetype].lines += newResult.lines;
      acc[newResult.filetype].codeLines += newResult.codeLines;
    } else {
      acc[newResult.filetype] = {
        files: 1,
        lines: newResult.lines,
        codeLines: newResult.codeLines
      };
    }
  }
}

function getFilename(path) {
  var lastSlash = path.lastIndexOf('/');
  if (lastSlash > -1) {
    return path.substring(lastSlash + 1);
  } else {
    return path;
  }
}

function countLines(rootDir, socket, onComplete) {
    socket.emit("console-output", "Counting lines...");
 
    var filesRemaining = 0; 
    var results = {};
    var walkComplete = false;

    var onFileParseResult = function(fileResult) {
        addResult(results, fileResult);
        filesRemaining -= 1;
        if (walkComplete && filesRemaining == 0) {
          socket.emit("results", results);
          onComplete();
        }
    };

    var onFile = function(path) {
      filesRemaining += 1;
      socket.emit("console-output", "Parsing file: " + getFilename(path));
      parser.parse(path, onFileParseResult);
    };

    walkRepo(rootDir, onFile);
    walkComplete = true;

}

var LineCount = {

  countLinesBuilder: function(onComplete) {
    return function(rootDir, socket) {
      countLines(rootDir, socket, onComplete);
    }
  }

};

module.exports = LineCount;