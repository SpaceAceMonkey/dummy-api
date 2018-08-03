require('./config_loader.js');
const express = require('express');
const logger = new(require('flexi-log'))();
const sprintf = require('sprintf-js');
const body_parser = require('body-parser');

global.services = [];
global.services.logger = logger;
global.services.express = express;
global.services.app = express();
global.services.sprintf = sprintf;
global.services.app.use(express.json());
global.services.app.use(body_parser.text());
global.services.app.use(express.urlencoded({extended: true}));

new(require('./dummy_api'));
