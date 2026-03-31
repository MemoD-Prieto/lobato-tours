import { Model, DataTypes, Sequelize } from 'sequelize';

export class Traslado extends Model {
  public id!: number;
  public cotizacion_id!: number;
  public tipo!: string;
  public amount!: number;
  public num_personas?: number;

  static initModel(sequelize: Sequelize) {
    Traslado.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cotizacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
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
      tableName: 'traslado',
      timestamps: false,
    });
  }

  static associate(models: any) {
    Traslado.belongsTo(models.Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
  }
}
