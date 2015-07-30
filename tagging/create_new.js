var path = require('path');
var program = require('commander');
program
	.option('-n, --notscratch', 'notscratch')
	.parse(process.argv);

process.customArgs = program;
console.log(process.customArgs);
require('dotenv').config({
	path: path.join(process.cwd(), 'envvars')
});
var RIPPER = require('./tag_ripper');
if(program.notscratch){
	RIPPER.fromExisting();
}else{
	RIPPER.start();
}
