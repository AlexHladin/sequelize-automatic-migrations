#!/usr/bin/env node

var path = require('path');
var ect = require('ect')();
var fs = require('fs');
var argv = require('yargs')
    .usage('Usage: sequelize-automatic-migrations -c [/path/to/config] -e [environment name] -d [/path/to/models] -i [/path/to/migrations] -m [model-name]')
    .alias('c', 'config')
    .alias('e', 'node-env')
    .alias('d', 'models-directory')
    .alias('i', 'migrations-directory')
    .alias('m', 'model-name')
    .describe('c', 'JSON file for Sequelize\'s constructor "options" flag object as defined here: https://sequelize.readthedocs.org/en/latest/api/sequelize/')
    .describe('e', 'Node environment name')
    .describe('d', 'Path to models directory')
    .describe('i', 'Path to migrations directory')
    .describe('m', 'Model name')
    .argv;

var config = require(path.resolve(argv.config));

if (argv['node-env']) {
    config = config[argv['node-env']];
}

var Classes = require('../index');

var log = console.log.bind(console, 'SAM: ');
var TEMPLATE = path.resolve(__dirname + '/../data/migration-file.js.ect');
var Model = Classes.Model;
var Field = Classes.Field;

var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    pool: config.pool
});

var DEFAULT_MODELS_DIR = './models';
var DEFAULT_MIGRATIONS_DIR = './migrations';

function format (i) {
    return parseInt(i, 10) < 10 ? '0' + i : i;
}

function getTimeStamp () {
    const date = new Date();
    return [
        date.getUTCFullYear(),
        format(date.getUTCMonth() + 1),
        format(date.getUTCDate()),
        format(date.getUTCHours()),
        format(date.getUTCMinutes()),
        format(date.getUTCSeconds())
    ].join('');
}

function genMigration(model, migrationsDir) {
    log('Generating migration for ', model.name);
    var m = new Model(model);
    var out = ect.render(TEMPLATE, { model: m, fieldOpts: Field.opts });
    var timestamp = getTimeStamp();
    var filename = timestamp + '-create_table_' + model.name + '_mi-generated.js';

    fs.writeFileSync(path.join(migrationsDir, filename), out);
}

function importModels(modelsDir) {
    fs.readdirSync(modelsDir)
        .filter(function(file) {
            return !file.endsWith('index.js') && file.match(/\.js/);
        })
        .forEach(function(file) {
           sequelize.import(path.join(modelsDir, file));
        });
    var models = sequelize.models;

    Object.keys(models).forEach(function (modelName) {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });
    return models;
}

function main() {
    var modelsDir = path.resolve(argv['models-directory'] || DEFAULT_MODELS_DIR);
    var migrationsDir = path.resolve(argv['migrations-directory'] || DEFAULT_MIGRATIONS_DIR);
    var modelName = argv['model-name'];

    log('modelsDir', modelsDir);

    var models = importModels(modelsDir);

    Object.keys(models)
        .filter(function (localModelName) {
            return modelName.includes(localModelName);
        })
        .forEach(function (modelName) {
            genMigration(models[modelName], migrationsDir);
        });
}

main();
