import { Model, DataTypes, Sequelize } from 'sequelize';

export class Visa extends Model {
  public id!: number;
  public cotizacion_id!: number;
  public pais!: string;
  public costo!: number;
  public tiempo!: string;
  public num_personas?: number;

  static initModel(sequelize: Sequelize) {
    Visa.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cotizacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pais: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      costo: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      tiempo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      num_personas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    }, {
      sequelize,
      tableName: 'visa',
      timestamps: false,
    });
  }

  static associate(models: any) {
    Visa.belongsTo(models.Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
  }
}
