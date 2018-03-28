const parser     = require('solidity-parser');
const asciiTable = require('ascii-table');
// const readFileTree = require('read-file-tree');
const getAllFiles = require('./utils.js').getAllFiles;

function generateReport(target, contract) {
  var table = new asciiTable(target);
  table.setHeading('Contract', 'Function', 'Visibility', 'Constant', 'Returns', 'Modifiers');

  contract.body.forEach(function(contract) {
    if(contract.type == 'ContractStatement') {
      contract.body.forEach(function(part) {
        if(part.type == "FunctionDeclaration" && part.is_abstract == false) {
          var func = parseFunctionPart(contract, part);
          table.addRow(func.contract, func.function, func.visibility, func.constant, func.returns, func.modifiers);
        }
      })
    }
  })
  console.log(table.toString());
}



function generateReportForDir(dir){
  const files = getAllFiles(dir);
  files.filter(file => file.split('.').pop() == 'sol')
    .forEach(file => {
      // console.log(`Report for ${file}`)
      try {
        contract = parser.parseFile(file);
        generateReport(file, contract);
      } catch(e) {
        // The parser doesn't handle some newer features in solidity. 
        // For now we just print the error and go to the next contract.
        console.log(`Error in File: ${file}`, e);
      }
    })
}


function parseFunctionPart(contract, part) {
  var contractName = contract.name,
      funcName     = part.name || "",
      params       = [];

  if(part.params) {
    part.params.forEach(function(param) {
      params.push(param.literal.literal);
    });
    funcName += "(" + params.join(',') + ")"
  } else {
    funcName += "()"
  }

  // Default is public
  var visibility = "public"
      isConstant = false,
      returns    = [],
      custom     = [];

  if(part.modifiers) {
    part.modifiers.forEach(function(mod) {
      switch(mod.name) {
        case "public":
          break;
        case "private":
          visibility = "private";
          break;
        case "internal":
          visibility = "internal";
          break;
        case "external":
          visibility = "external";
          break;
        case "constant":
          isConstant = true;
          break;
        case "returns":
          mod.params.forEach(function(param) {
            returns.push(param.name);
          });
          break;
        default:
          custom.push(mod.name);
      }
    });
  }

  return {
    contract:   contractName,
    function:   funcName,
    visibility: visibility,
    constant:   isConstant,
    returns:    returns,
    modifiers:  custom
  }
}

module.exports = {
  generateReport,
  generateReportForDir,
}