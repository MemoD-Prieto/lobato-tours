import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface ItinerarioVueloAttributes {
  id: number;
  price_quote_id: number;
  itinerary_image: Buffer;
}

type ItinerarioVueloCreationAttributes = Optional<ItinerarioVueloAttributes, 'id'>;

export class ItinerarioVuelo extends Model<ItinerarioVueloAttributes, ItinerarioVueloCreationAttributes> implements ItinerarioVueloAttributes {
  public id!: number;
  public price_quote_id!: number;
  public itinerary_image!: Buffer;

  static initModel(sequelize: Sequelize) {
    ItinerarioVuelo.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      price_quote_id: DataTypes.INTEGER,
      itinerary_image: DataTypes.BLOB
    }, {
      sequelize,
      tableName: 'itinerario_vuelo',
      timestamps: false
    });
  }

  static associate(models: any) {
    ItinerarioVuelo.belongsTo(models.Cotizacion, { foreignKey: 'price_quote_id' });
  }
}
