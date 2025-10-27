import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { basename as _basename } from 'path';
import { fileURLToPath } from 'url';

const basename = _basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env]; // ← usa .js si el config es .js
const db: { [key: string]: any } = {};

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]!, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.ts' && // detecta archivos .ts
      !file.endsWith('.test.ts')
    );
  })
  .forEach(file => {
    const modelModule = require(path.join(__dirname, file));
    const modelClass = Object.values(modelModule)[0]; // export default or named export
    const modelAny = modelClass as any;
    if (typeof modelAny.initModel === 'function') {
      modelAny.initModel(sequelize);
      db[modelAny.name] = modelAny;
    }
  });

// Associate all models if associate() exists
Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
