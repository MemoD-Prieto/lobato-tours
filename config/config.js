require('dotenv').config(); // para que lea el .env

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mydatabase',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5430,
    dialect: 'postgres'
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME_TEST || 'clt_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5430,
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME_PROD || 'clt_prod',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5430,
    dialect: 'postgres'
  }
};
