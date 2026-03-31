import { Model, DataTypes, Sequelize } from 'sequelize';

export class Seguro extends Model {
  public id!: number;
  public cotizacion_id!: number;
  public insurance_company!: string;
  public other_insurance_company?: string;
  public tipo!: string;
  public costo!: number;
  public num_personas?: number;

  static initModel(sequelize: Sequelize) {
    Seguro.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cotizacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      insurance_company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      other_insurance_company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tipo: {
        type: DataTypes.STRING,
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
      tableName: 'seguro',
      timestamps: false,
    });
  }

  static associate(models: any) {
    Seguro.belongsTo(models.Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
  }
}
