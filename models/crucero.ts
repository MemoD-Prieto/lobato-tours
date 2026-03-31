import { Model, DataTypes, Sequelize } from 'sequelize';

export class Crucero extends Model {
  public id!: number;
  public cotizacion_id!: number;
  public cruise_line!: string;
  public other_cruise_line!: string;
  public nombre!: string;
  public precio!: number;
  public duracion!: number;
  public num_personas?: number;

  static initModel(sequelize: Sequelize) {
    Crucero.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cotizacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cruise_line: {
        type: DataTypes.STRING,
        allowNull: true
      },
      other_cruise_line: {
        type: DataTypes.STRING,
        allowNull: true
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: true
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      duracion: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      num_personas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      }
    }, {
      sequelize,
      tableName: 'crucero',
      timestamps: false
    });
  }

  static associate(models: any) {
    Crucero.belongsTo(models.Cotizacion, { foreignKey: 'cotizacion_id' });
  }
}


