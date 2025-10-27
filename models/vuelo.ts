import { Model, DataTypes, Sequelize } from 'sequelize';

export class Vuelo extends Model {
  public price_quote_id!: number;
  public base_fee!: number;
  public iva!: number;
  public luggage_check!: number;
  public airport_right_of_use!: number;
  public suitcases_tax!: number;

  static initModel(sequelize: Sequelize) {
    Vuelo.init({
      price_quote_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      base_fee: DataTypes.DOUBLE,
      iva: DataTypes.DECIMAL,
      luggage_check: DataTypes.DECIMAL,
      airport_right_of_use: DataTypes.DECIMAL,
      suitcases_tax: DataTypes.DECIMAL
    }, {
      sequelize,
      tableName: 'vuelo',
      timestamps: false
    });
  }

  static associate(models: any) {
    Vuelo.belongsTo(models.Cotizacion, { foreignKey: 'price_quote_id' });
  }
}
