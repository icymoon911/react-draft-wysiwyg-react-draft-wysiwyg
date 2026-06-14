/**
 * Programmatic mocha runner that works with Node 22+ ESM/CJS interop.
 *
 * The default `mocha` CLI on Node 22 tries to `import()` test files as ESM,
 * which bypasses @babel/register's CJS hook. Loading mocha programmatically
 * after requiring the babel compiler + test setup keeps everything in CJS.
 *
 * Usage:  node config/run-tests.js
 */
require("@babel/core");

// CSS / asset stubs — same as test-compiler.js
function noop() { return null; }
require.extensions[".css"] = noop;
require.extensions[".svg"] = noop;
require.extensions[".png"] = noop;

// Babel transpilation + jsdom + enzyme adapter
require("@babel/register")({ extensions: [".js", ".jsx"] });
require("./test-setup");

const fs = require("fs");
const path = require("path");
const Mocha = require("mocha");

const mocha = new Mocha({ timeout: 10000 });

/**
 * Recursively find files matching a pattern under src/.
 */
function findTestFiles(dir, results) {
  results = results || [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      findTestFiles(full, results);
    } else if (entry.name.endsWith("Test.js")) {
      results.push(full);
    }
  }
  return results;
}

const srcDir = path.resolve(__dirname, "..", "src");
const testFiles = findTestFiles(srcDir);
testFiles.forEach((file) => mocha.addFile(file));

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
