import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface HotelAttributes {
  id: number;
  price_quote_id: number;
  name: string;
  nights: number;
}

type HotelCreationAttributes = Optional<HotelAttributes, 'id'>;

export class Hotel extends Model<HotelAttributes, HotelCreationAttributes> implements HotelAttributes {
  public id!: number;
  public price_quote_id!: number;
  public name!: string;
  public nights!: number;

  static initModel(sequelize: Sequelize) {
    Hotel.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      price_quote_id: DataTypes.INTEGER,
      name: DataTypes.STRING(200),
      nights: DataTypes.INTEGER
    }, {
      sequelize,
      tableName: 'hotel',
      timestamps: false
    });
  }

  static associate(models: any) {
    Hotel.belongsTo(models.Cotizacion, { foreignKey: 'price_quote_id' });
    Hotel.hasMany(models.Distribucion, { foreignKey: 'hotel_id' });
    Hotel.hasMany(models.Comida, { foreignKey: 'id_hotel' });
  }
}
