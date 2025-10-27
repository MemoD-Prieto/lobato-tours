import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface ActividadAttributes {
  id: number;
  itinerary_id: number;
  day_number: number;
  place: string;
  date: string;
  description: string;
}

type ActividadCreationAttributes = Optional<ActividadAttributes, 'id'>;

export class Actividad extends Model<ActividadAttributes, ActividadCreationAttributes> implements ActividadAttributes {
  public id!: number;
  public itinerary_id!: number;
  public day_number!: number;
  public place!: string;
  public date!: string;
  public description!: string;

  static initModel(sequelize: Sequelize) {
    Actividad.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      itinerary_id: DataTypes.INTEGER,
      day_number: DataTypes.INTEGER,
      place: DataTypes.STRING(200),
      date: DataTypes.DATEONLY,
      description: DataTypes.TEXT
    }, {
      sequelize,
      tableName: 'actividad',
      timestamps: false
    });
  }

  static associate(models: any) {
    Actividad.belongsTo(models.ItinerarioViaje, { foreignKey: 'itinerary_id' });
  }
}
