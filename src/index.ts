import * as fs from 'fs';
import { Compiler } from 'webpack';

interface ObjectMap {
  [key: string]: any;
}

interface sassFilesObject {
  [key: string]: string;
}

const isLine = (line: string | undefined): line is string => {
  return !!line;
};

/**
 * @param string[] variables
 * @returns An array containing sanitized vars string as "key: value" format,
 * transform kebabCase in camelCase and sanitizing it removing ";"
 */
const getSanitizedCamelCaseVarLines = (lines: string[]): string[] =>
  lines
    .map((v) => {
      if (v.startsWith('$')) {
        return v.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(';', '');
      }
    })
    .filter(isLine);

/**
 * Transform an array containing strings as "key: value" format into { key: value } of an object
 * @param string[] varsList
 * @returns { [key: string]: any } Object
 */
const getVarsMap = (varsList: string[]): ObjectMap =>
  varsList.reduce((acc: ObjectMap, current: string) => {
    const [key, val] = current.split(': ');
    acc[key] = val;

    return acc;
  }, {});

/**
 * For vars containing value pointing to another variable, we resolve it replacing by its value
 * @param { [key:string]: any } vars
 * @returns An object containing vars as keys and resolved values
 */
const resolveVarValues = (vars: ObjectMap): ObjectMap => {
  const clonedVars = { ...vars };
  for (const key in clonedVars) {
    if (clonedVars[key].startsWith('$')) {
      const varValue = clonedVars[clonedVars[key]];
      clonedVars[key] = varValue;
    }
  }
  return clonedVars;
};

/**
 * Plugin to extract SASS vars and compile into the js build
 * @param files An Array containing { key: sassFilePath } 
 * The generated JSON file will have the same format as files params 
 * e.g: files = [
        { color: 'path/to/_colors.scss' },
        { font: '.path/to/_fonts.scss' },
      ]
    JSON will be generated as {
      { color: {[key:string]: string} },
      { font: {[key:string]: string} },
    }
 * @param saveJsonToPath An String containing the pathToSave the json file
 */
class SassExtractVarsPlugin {
  files: sassFilesObject[] = [];
  saveJsonToPath: string;

  constructor(files: sassFilesObject[], saveJsonToPath: string) {
    this.files = files;
    this.saveJsonToPath = saveJsonToPath;
  }

  apply(compiler: Compiler) {
    this.files.forEach((file) => {
      const [key, filePath] = Object.entries(file)[0];
      // Get the SASS content from files
      // and replace the value of the object from file path to content of the file
      file[key] = fs.readFileSync(filePath, { encoding: 'utf-8' });
    });

    compiler.hooks.compilation.tap('SassExtractVarsPlugin', () => {
      const result: ObjectMap = {};
      this.files.forEach((file) => {
        const [key, fileText] = Object.entries(file)[0];

        const fileLines = fileText.split('\n');
        // Transform any KebabCase into camelCase and sanitize values
        const varsList = getSanitizedCamelCaseVarLines(fileLines);
        // Transform list of strings in "key: value" format into a {key: value} object.
        // Each object key will be the SASS variable
        const varsMap = getVarsMap(varsList);

        // For vars containing value pointing to another variable, we resolve it replacing by the var value
        result[key] = resolveVarValues(varsMap);
      });

      // Converts it into a JSON and creates temp JSON file before webpack compile
      const jsonResult = JSON.stringify(result, null, ' ');

      fs.writeFileSync(this.saveJsonToPath, jsonResult, {
        encoding: 'utf-8',
        flag: 'w',
      });
    });
  }
}

module.exports = SassExtractVarsPlugin;
