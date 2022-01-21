import path from "path";
import fs from "fs-extra";
import glob from "glob";
import deepmerge from "deepmerge";

if (process.argv.length < 4) {
  throw new Error("Expected at least 4 runtime arguments");
}

const args = process.argv.slice(process.argv.length - 4);

const mappingPath = path.resolve(args[0]);
const appPath = path.resolve(args[1]);
const destinationPath = path.resolve(args[2]);
const database = args[3];
let database_name;

console.log(`Copying ${appPath} to ${destinationPath} (overwriting)`);
// fs.removeSync(destinationPath);
fs.copySync(appPath, destinationPath, { overwrite: true });

function getDirectories(path: any) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
}

if (database === "production") {
  database_name = "simple-auth";
} else if (database === "development") {
  database_name = "simple-auth-dev";
} else if (database === "staging") {
  database_name = "simple-auth-staging";
} else if (database === "dev-david") {
  database_name = "simple-auth-dev";
}

const dirName = getDirectories(
  "./packages/realm-backend/data_sources/mongodb-atlas/"
);
// const configDir = getDirectories(
//   "./config/realm_config/data_sources/mongodb-atlas/"
// );

// fs.renameSync(
//   `./config/realm_config/data_sources/mongodb-atlas/${configDir[0]}`,
//   `./config/realm_config/data_sources/mongodb-atlas/${database_name}`
// );

fs.renameSync(
  `./packages/realm-backend/data_sources/mongodb-atlas/${dirName[0]}`,
  `./packages/realm-backend/data_sources/mongodb-atlas/${database_name}`
);

const mapping = fs.readJSONSync(mappingPath);
for (const [fileGlob, replacement] of Object.entries(mapping)) {
  const files = glob.sync(fileGlob, { cwd: destinationPath });
  for (const relativeFilePath of files) {
    const filePath = path.resolve(destinationPath, relativeFilePath);
    const content = fs.readJSONSync(filePath);
    const mergedContent = deepmerge(content, replacement as any);
    fs.writeJSONSync(filePath, mergedContent, { spaces: 4 });
  }
}
// ts-node --project config/scripts/tsconfig.json config/scripts/search-replace.ts config/realm_config/production.json packages/realm-backend packages/realm-backend
