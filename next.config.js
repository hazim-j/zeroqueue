const fs = require('fs');
const path = require('path');

const WORKER_TEMPLATE_DIR = path.join(__dirname, './examples/workers/worker.template.js');

module.exports = {
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  env: {
    WORKER_TEMPLATE: fs.readFileSync(WORKER_TEMPLATE_DIR).toString(),
  },
};
