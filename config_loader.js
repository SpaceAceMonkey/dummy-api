const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

global.appRoot = path.resolve(__dirname);
global.appEnvironment = process.env.DUMMY_API_ENV || 'dev';
global.appConfig = yaml.safeLoad(
    fs.readFileSync(
        global.appRoot
        + "/config/"
        + global.appEnvironment
        + ".yml"
    ),
    'utf8'
);
