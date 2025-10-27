import { Model, DataTypes, Sequelize } from 'sequelize';

export class Distribucion extends Model {
  public id!: number;
  public hotel_id!: number;

  static initModel(sequelize: Sequelize) {
    Distribucion.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      hotel_id: DataTypes.INTEGER
    }, {
      sequelize,
      tableName: 'distribucion',
      timestamps: false
    });
  }

  static associate(models: any) {
    Distribucion.belongsTo(models.Hotel, { foreignKey: 'hotel_id' });
    Distribucion.hasMany(models.Habitacion, { foreignKey: 'distribution_id' });
  }
}
