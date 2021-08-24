const db = require('../config/db');
const { DataTypes } = require('sequelize');

const status = db.define('hit_status', {
    id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    freezeTableName: true
});

module.exports = status
