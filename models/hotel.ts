import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface HotelAttributes {
  id: number;
  price_quote_id: number;
  name: string;
  nights: number;
  num_personas?: number | null;
}

type HotelCreationAttributes = Optional<HotelAttributes, 'id'>;

export class Hotel extends Model<HotelAttributes, HotelCreationAttributes> implements HotelAttributes {
  public id!: number;
  public price_quote_id!: number;
  public name!: string;
  public nights!: number;
  public num_personas?: number | null;

  static initModel(sequelize: Sequelize) {
    Hotel.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      price_quote_id: DataTypes.INTEGER,
      name: DataTypes.STRING(200),
      nights: DataTypes.INTEGER,
      num_personas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      }
    }, {
      sequelize,
      tableName: 'hotel',
      timestamps: false
    });
  }

  static associate(models: any) {
    Hotel.belongsTo(models.Cotizacion, { foreignKey: 'price_quote_id' });
    Hotel.hasMany(models.Distribucion, { foreignKey: 'hotel_id' });
  }
}
