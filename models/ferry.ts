import { Model, DataTypes, Sequelize } from 'sequelize';

export class Ferry extends Model {
  public id!: number;
  public cotizacion_id!: number;
  public ruta!: string;
  public precio!: number;
  public horario!: string;
  public num_personas?: number;

  static initModel(sequelize: Sequelize) {
    Ferry.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cotizacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ruta: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      horario: {
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
      tableName: 'ferry',
      timestamps: false,
    });
  }

  static associate(models: any) {
    Ferry.belongsTo(models.Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
  }
}
