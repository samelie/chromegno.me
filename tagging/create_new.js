var path = require('path');
var program = require('commander');
program
	.option('-n, --noupload', 'noupload')
	.option('-s, --skip', 'Skip')
	.option('-c, --clean', 'Clean')
	.parse(process.argv);

process.customArgs = program;
require('dotenv').config({
	path: path.join(process.cwd(), 'envvars')
});
var RIPPER = require('./tag_ripper');
RIPPER.start();
