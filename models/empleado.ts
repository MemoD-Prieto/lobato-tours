import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface EmpleadoAttributes {
  user_name: string;
  real_name: string;
  password_hash?: Buffer;
  salt?: string;
  creation_date: Date;
  last_accessed?: Date;
  type: number;
  active: number;
}

type EmpleadoCreationAttributes = Optional<EmpleadoAttributes, 'password_hash' | 'salt' | 'last_accessed'>;

export class Empleado extends Model<EmpleadoAttributes, EmpleadoCreationAttributes> implements EmpleadoAttributes {
  public user_name!: string;
  public real_name!: string;
  public password_hash?: Buffer;
  public salt?: string;
  public creation_date!: Date;
  public last_accessed?: Date;
  public type!: number;
  public active!: number;

  static initModel(sequelize: Sequelize) {
    Empleado.init({
      user_name: {
        type: DataTypes.STRING(50),
        primaryKey: true
      },
      real_name: DataTypes.STRING(150),
      password_hash: DataTypes.BLOB,
      salt: DataTypes.UUID,
      creation_date: DataTypes.DATE,
      last_accessed: DataTypes.DATE,
      type: DataTypes.INTEGER,
      active: DataTypes.INTEGER
    }, {
      sequelize,
      tableName: 'empleado',
      timestamps: false
    });
  }

  static associate(models: any) {
    Empleado.hasMany(models.Cotizacion, { foreignKey: 'employee_id' });
  }
}
