const db = require('../config/db');
const { DataTypes } = require('sequelize');
const hitmen = require('./user')
const status = require('./status')

const hit = db.define('hit', {
    id: {
        type: DataTypes.NUMBER,
        allowNull: true,
        primaryKey: true
    },
    hitmen_id: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    target_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status_id: {
        type: DataTypes.NUMBER,
        allowNull: true
    },
    creator_id: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
}, {
    freezeTableName: true
});

hit.belongsTo(hitmen, {foreignKey: 'hitmen_id'});
hit.belongsTo(hitmen, {as: 'h2', foreignKey: 'creator_id'});
hit.hasOne(status, {foreignKey: 'id'})

module.exports = hit
