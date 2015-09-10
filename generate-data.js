#!/usr/bin/node --harmony
/***
 * This is a generator of `data.js`, which for now contains data that would be retrieved from back-end in the future.
 ***/

console.log(process.argv);
var fs = require('fs');
var path = require('path')
var dir = process.argv[2] || "./code";
var output = process.argv[3] || "./data.js";
var filenames = fs.readdirSync(dir);

var files = filenames.filter(filename=> filename.match(/\.js$/)).map(filename => {
  return {
    content: fs.readFileSync(path.join(dir, filename), {encoding: "utf-8"}),
    title: filename
  };
});

fs.writeFile(output, "var Data = Data || {}; Data.files = " + JSON.stringify(files) + ";\n");
