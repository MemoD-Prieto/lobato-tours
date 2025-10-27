import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface CotizacionAttributes {
  id: number;
  employee_id: string;
  pre_travel_itinerary: string;
  transfers: number;
  jacket: number;
  tickets: number;
  snacks: number;
  guide: number;
  ticketholder: number;
  insurance: number;
  greeting_message: string;
  goodbye_message: string;
  creation_date: Date;
  active: number;
}

type CotizacionCreationAttributes = Optional<CotizacionAttributes, 'id'>;

export class Cotizacion extends Model<CotizacionAttributes, CotizacionCreationAttributes> implements CotizacionAttributes {
  public id!: number;
  public employee_id!: string;
  public pre_travel_itinerary!: string;
  public transfers!: number;
  public jacket!: number;
  public tickets!: number;
  public snacks!: number;
  public guide!: number;
  public ticketholder!: number;
  public insurance!: number;
  public greeting_message!: string;
  public goodbye_message!: string;
  public creation_date!: Date;
  public active!: number;

  static initModel(sequelize: Sequelize) {
    Cotizacion.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      employee_id: DataTypes.STRING,
      pre_travel_itinerary: DataTypes.TEXT,
      transfers: DataTypes.DECIMAL,
      jacket: DataTypes.DECIMAL,
      tickets: DataTypes.DECIMAL,
      snacks: DataTypes.DECIMAL,
      guide: DataTypes.DECIMAL,
      ticketholder: DataTypes.DECIMAL,
      insurance: DataTypes.DECIMAL,
      greeting_message: DataTypes.TEXT,
      goodbye_message: DataTypes.TEXT,
      creation_date: DataTypes.DATE,
      active: DataTypes.INTEGER
    }, {
      sequelize,
      tableName: 'cotizacion',
      timestamps: false
    });
  }

  static associate(models: any) {
    Cotizacion.belongsTo(models.Empleado, { foreignKey: 'employee_id' });
    Cotizacion.hasMany(models.Cliente, { foreignKey: 'price_quote_id' });
  }
}
