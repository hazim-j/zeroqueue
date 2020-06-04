const parseDbUrl = require('parse-database-url');

const env = process.env.NODE_ENV || 'development';
const dbConfig = parseDbUrl(process.env.DATABASE_URL);

module.exports = {
  [env]: {
    username: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.driver,
    seederStorage: 'sequelize',
  },
};
