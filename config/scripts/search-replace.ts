import path from "path";
import fs from "fs-extra";
import glob from "glob";
import deepmerge from "deepmerge";

if (process.argv.length < 4) {
  throw new Error("Expected at least 4 runtime arguments");
}

const args = process.argv.slice(process.argv.length - 3);

const mappingPath = path.resolve(args[0]);
const appPath = path.resolve(args[1]);
const destinationPath = path.resolve(args[2]);

console.log(`Copying ${appPath} to ${destinationPath} (overwriting)`);
// fs.removeSync(destinationPath);
fs.copySync(appPath, destinationPath, { overwrite: true });

const mapping = fs.readJSONSync(mappingPath);
for (const [fileGlob, replacement] of Object.entries(mapping)) {
  const files = glob.sync(fileGlob, { cwd: destinationPath });
  for (const relativeFilePath of files) {
    const filePath = path.resolve(destinationPath, relativeFilePath);
    const content = fs.readJSONSync(filePath);
    const mergedContent = deepmerge(content, replacement as any);
    fs.writeJSONSync(filePath, mergedContent, { spaces: 2 });
  }
}

// ts-node --project config/scripts/tsconfig.json config/scripts/search-replace.ts config/realm_config/production.json packages/realm-backend packages/realm-backend
