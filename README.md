# TypeScript to UML reverse engineering

[![Build Status](https://travis-ci.org/fsahmad/typescript-uml.svg?branch=master)](https://travis-ci.org/fsahmad/typescript-uml)
[![Test Coverage](https://codeclimate.com/github/fsahmad/typescript-uml/badges/coverage.svg)](https://codeclimate.com/github/fsahmad/typescript-uml/coverage)
[![npm version](https://badge.fury.io/js/typescript-uml.svg)](https://badge.fury.io/js/typescript-uml)

Work in progress



### A quick way to get it working in your project:

1. Add this project as a dev dependency.

2. Add a script entry to your package json.  e.g. `"generate-uml-diagram": "node ./scripts/generate-uml-diagram.js"`

3. paste the below code snippit into the .js file linked the script entry above.

4. run the script, passing in the file to generate the uml diagram for (e.g. `node run generate-uml-diagram -- path/to/my/file.ts`.  Or, you could pass "project" to generate a uml diagram for your whole project.

```
var TSUml = require("typescript-uml");
var fs = require("fs");

var args = process.argv.slice(2);

if (args.length === 0) {
  console.log("No filenames were given.");
  console.log("try something like: node run generate-uml-diagram -- path/to/my/file.ts");
  console.log('You can also use the filename "project" to generate a UML for the whole ts project');
  process.exit(0);
}

const UML_DIRECTORY = "./UMLs/";
if (!fs.existsSync(UML_DIRECTORY)) {
  fs.mkdirSync(UML_DIRECTORY);
}

args.forEach(filename => {
  const outFile = UML_DIRECTORY + filename.replace(/\//g, "_") + ".puml";
  console.log("Generating UML file for [" + filename + "] as [" + outFile + "].");

  try {
    let model;
    if (filename === "project") {
      model = TSUml.TypeScriptUml.parseProject(".");
    } else {
      model = TSUml.TypeScriptUml.parseFile(filename);
    }

    const diagram = TSUml.TypeScriptUml.generateClassDiagram(model, {
      formatter: "plantuml",
      plantuml: {
        diagramTags: true,
      },
    });
    fs.writeFile(outFile, diagram, function(err) {
      if (err) {
        return console.log(err);
      }
    });
  } catch (error) {
    console.log("An error occured for file (" + filename + "): " + error);
  }
});
```

