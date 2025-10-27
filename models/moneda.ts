import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface MonedaAttributes {
  id: number;
  price_quote_id: number;
  dollar: boolean;
  exchange_rate: number;
}

type MonedaCreationAttributes = Optional<MonedaAttributes, 'id'>;

export class Moneda extends Model<MonedaAttributes, MonedaCreationAttributes> implements MonedaAttributes {
  public id!: number;
  public price_quote_id!: number;
  public dollar!: boolean;
  public exchange_rate!: number;

  static initModel(sequelize: Sequelize) {
    Moneda.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      price_quote_id: DataTypes.INTEGER,
      dollar: DataTypes.BOOLEAN,
      exchange_rate: DataTypes.DECIMAL
    }, {
      sequelize,
      tableName: 'moneda',
      timestamps: false
    });
  }

  static associate(models: any) {
    Moneda.belongsTo(models.Cotizacion, { foreignKey: 'price_quote_id' });
  }
}
