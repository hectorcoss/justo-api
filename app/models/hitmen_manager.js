const db = require('../config/db');
const { DataTypes } = require('sequelize');

const hitmen_manager = db.define('hitmen_manager', {
    hitmen_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
    },
    manager_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
    },
}, {
    freezeTableName: true
});

module.exports = hitmen_manager
