const mysql = require('mysql');
const Sequelize = require("sequelize");
const env = require('../config/env');

const connection = new Sequelize(
    env.db.database,
    env.db.user,
    env.db.password,
    {
        host: env.db.host,
        port: 3306,
        dialect: 'mysql',
        define: { timestamps: false }
    }
    );

module.exports = connection;
