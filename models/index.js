import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();
const dirname = path.join(serverRuntimeConfig.PROJECT_ROOT, './models');
const basename = path.basename(__filename);
const db = {};
const sequelize = new Sequelize(process.env.DATABASE_URL);

fs.readdirSync(dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = sequelize['import'](path.join(dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
