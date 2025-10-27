import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface ItinerarioViajeAttributes {
  id: number;
  price_quote_id: number;
  additional_night: boolean;
}

type ItinerarioViajeCreationAttributes = Optional<ItinerarioViajeAttributes, 'id'>;

export class ItinerarioViaje extends Model<ItinerarioViajeAttributes, ItinerarioViajeCreationAttributes> implements ItinerarioViajeAttributes {
  public id!: number;
  public price_quote_id!: number;
  public additional_night!: boolean;

  static initModel(sequelize: Sequelize) {
    ItinerarioViaje.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      price_quote_id: DataTypes.INTEGER,
      additional_night: DataTypes.BOOLEAN
    }, {
      sequelize,
      tableName: 'itinerario_viaje',
      timestamps: false
    });
  }

  static associate(models: any) {
    ItinerarioViaje.belongsTo(models.Cotizacion, { foreignKey: 'price_quote_id' });
    ItinerarioViaje.hasMany(models.Actividad, { foreignKey: 'itinerary_id' });
  }
}
