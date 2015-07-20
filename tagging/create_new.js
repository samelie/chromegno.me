var path = require('path');
require('dotenv').config({
	path: path.join(process.cwd(), 'envvars')
});
var RIPPER = require('./tag_ripper');
RIPPER.start();
