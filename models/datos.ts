import { Model, DataTypes, Sequelize } from 'sequelize';

export class Datos extends Model {
  public id!: number;
  public cotizacion_id!: number;
  public proveedor_plan!: string;
  public inicio?: Date;
  public costo!: number;
  public num_personas?: number;

  static initModel(sequelize: Sequelize) {
    Datos.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cotizacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      proveedor_plan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      inicio: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      costo: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      num_personas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    }, {
      sequelize,
      tableName: 'datos',
      timestamps: false,
    });
  }

  static associate(models: any) {
    Datos.belongsTo(models.Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
  }
}
