import { Model, DataTypes, Sequelize } from 'sequelize';

export class Habitacion extends Model {
  public id!: number;
  public distribution_id!: number;
  public client_id!: number;
  public type!: string;
  public number_of_people!: number;
  public price!: number;
  public iva!: number;

  static initModel(sequelize: Sequelize) {
    Habitacion.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      distribution_id: DataTypes.INTEGER,
      client_id: DataTypes.INTEGER,
      type: DataTypes.STRING,
      number_of_people: DataTypes.INTEGER,
      price: DataTypes.DECIMAL,
      iva: DataTypes.DECIMAL
    }, {
      sequelize,
      tableName: 'habitacion',
      timestamps: false
    });
  }

  static associate(models: any) {
    Habitacion.belongsTo(models.Cliente, { foreignKey: 'client_id' });
    Habitacion.belongsTo(models.Distribucion, { foreignKey: 'distribution_id' });
  }
}
