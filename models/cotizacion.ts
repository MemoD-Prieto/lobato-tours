import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface CotizacionAttributes {
  id: number;
  employee_id: string;
  pre_travel_itinerary: string;
  jacket: number;
  tickets: number;
  snacks: number;
  guide: number;
  ticketholder: number;
  commission: number;
  greeting_message: string;
  goodbye_message: string;
  finished: boolean;
  creation_date: Date;
}

type CotizacionCreationAttributes = Optional<CotizacionAttributes, 'id'>;

export class Cotizacion
  extends Model<CotizacionAttributes, CotizacionCreationAttributes>
  implements CotizacionAttributes {

  public id!: number;
  public employee_id!: string;
  public pre_travel_itinerary!: string;
  public jacket!: number;
  public tickets!: number;
  public snacks!: number;
  public guide!: number;
  public ticketholder!: number;
  public commission!: number;
  public greeting_message!: string;
  public goodbye_message!: string;
  public finished!: boolean;
  public creation_date!: Date;

  static initModel(sequelize: Sequelize) {
    Cotizacion.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employee_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pre_travel_itinerary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      jacket:      { type: DataTypes.INTEGER, defaultValue: 0 },
      tickets:     { type: DataTypes.INTEGER, defaultValue: 0 },
      snacks:      { type: DataTypes.INTEGER, defaultValue: 0 },
      guide:       { type: DataTypes.INTEGER, defaultValue: 0 },
      ticketholder:{ type: DataTypes.INTEGER, defaultValue: 0 },
      commission:  { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      greeting_message: { type: DataTypes.TEXT },
      goodbye_message:  { type: DataTypes.TEXT },
      finished:    { type: DataTypes.BOOLEAN, defaultValue: false },
      creation_date:{ type: DataTypes.DATE,   defaultValue: DataTypes.NOW },
    }, {
      sequelize,
      tableName: 'cotizacion',
      timestamps: false,
    });
  }

  static associate(models: any) {
    Cotizacion.belongsTo(models.Empleado,    { foreignKey: 'employee_id' });
    Cotizacion.hasMany(models.Cliente,       { foreignKey: 'cotizacion_id', as: 'clientes' });
    Cotizacion.hasOne(models.Moneda,         { foreignKey: 'cotizacion_id', as: 'moneda' });
    Cotizacion.hasOne(models.Viaje,          { foreignKey: 'cotizacion_id', as: 'viaje' });
    Cotizacion.hasOne(models.Vuelo,          { foreignKey: 'cotizacion_id', as: 'vuelo' });
    Cotizacion.hasOne(models.Crucero,        { foreignKey: 'cotizacion_id', as: 'crucero' });
    Cotizacion.hasMany(models.Hotel,         { foreignKey: 'cotizacion_id', as: 'hoteles' });
    Cotizacion.hasOne(models.Traslado,       { foreignKey: 'cotizacion_id', as: 'traslado' });
    Cotizacion.hasOne(models.Entradas,       { foreignKey: 'cotizacion_id', as: 'entradas' });
    Cotizacion.hasOne(models.Ferry,          { foreignKey: 'cotizacion_id', as: 'ferry' });
    Cotizacion.hasOne(models.Seguro,         { foreignKey: 'cotizacion_id', as: 'seguro' });
    Cotizacion.hasOne(models.Datos,          { foreignKey: 'cotizacion_id', as: 'datos' });
    Cotizacion.hasOne(models.Visa,           { foreignKey: 'cotizacion_id', as: 'visa' });
  }
}
