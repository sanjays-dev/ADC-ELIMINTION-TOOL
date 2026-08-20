const path = require('path');
const Mocha = require('mocha');

async function run() {
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: 60000,
  });

  const testsRoot = __dirname;
  mocha.addFile(path.resolve(testsRoot, 'integration.test.js'));

  return new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} integration test(s) failed.`));
      } else {
        resolve();
      }
    });
  });
}

module.exports = { run };
