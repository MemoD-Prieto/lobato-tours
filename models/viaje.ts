import { Model, DataTypes, Sequelize } from 'sequelize';

export class Viaje extends Model {
  public price_quote_id!: number;
  public travel_destiny!: string;
  public package_name?: string;
  public package_description?: string;
  public package_price?: number;
  public travel_begin!: Date;
  public travel_end!: Date;

  static initModel(sequelize: Sequelize) {
    Viaje.init({
      price_quote_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      travel_destiny: DataTypes.TEXT,
      package_name: DataTypes.TEXT,
      package_description: DataTypes.TEXT,
      package_price: DataTypes.DECIMAL,
      travel_begin: DataTypes.DATEONLY,
      travel_end: DataTypes.DATEONLY
    }, {
      sequelize,
      tableName: 'viaje',
      timestamps: false
    });
  }

  static associate(models: any) {
    Viaje.belongsTo(models.Cotizacion, { foreignKey: 'price_quote_id' });
  }
}
