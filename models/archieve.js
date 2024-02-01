const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Archieves = sequelize.define('archieves', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    message: {
       type:  Sequelize.STRING,
       allowNull: false,
    },
    type : Sequelize.STRING
})

module.exports = Archieves;