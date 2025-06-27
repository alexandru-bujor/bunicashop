import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING
    },
    message: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('new', 'viewed', 'contacted', 'converted', 'closed'),
        defaultValue: 'new'
    },
    source: {
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

export default Lead; 