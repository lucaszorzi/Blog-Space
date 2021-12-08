const Sequelize = require('sequelize');

const connection = new Sequelize('blogspacedb', 'root', 'lukinhass', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-03:00'
});

module.exports = connection;