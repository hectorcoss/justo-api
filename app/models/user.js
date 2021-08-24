const db = require('../config/db');
const { DataTypes } = require('sequelize');

const user = db.define('user', {
    id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        isEmail: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    type_id: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
}, {
    freezeTableName: true
});

module.exports = user
