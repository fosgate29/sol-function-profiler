const profiler    = require('./index.js');
const argv        = require('yargs').argv;
const parser      = require("solidity-parser");
 
if (argv.dir) {
  profiler.generateReportForDir(argv.dir);
} else {
  let arg_index = argv._.length - 1;
  let target   = argv._[arg_index]; // argv puts the final arguments in an array named "_"
  contract = parser.parseFile(target);
  profiler.generateReport(target, contract);
}

