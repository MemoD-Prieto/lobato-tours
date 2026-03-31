import { Model, DataTypes, Sequelize } from 'sequelize';

export class Entradas extends Model {
  public id!: number;
  public cotizacion_id!: number;
  public atraccion!: string;
  public precio!: number;
  public cantidad!: number;
  public num_personas?: number;

  static initModel(sequelize: Sequelize) {
    Entradas.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cotizacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      atraccion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      num_personas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    }, {
      sequelize,
      tableName: 'entradas',
      timestamps: false,
    });
  }

  static associate(models: any) {
    Entradas.belongsTo(models.Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
  }
}
