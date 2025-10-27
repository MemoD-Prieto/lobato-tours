import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface ClienteAttributes {
  id: number;
  price_quote_id: number;
  customer_name: string;
  customer_contact: string;
  customer_contact2?: string;
}

type ClienteCreationAttributes = Optional<ClienteAttributes, 'id' | 'customer_contact2'>;

export class Cliente extends Model<ClienteAttributes, ClienteCreationAttributes> implements ClienteAttributes {
  public id!: number;
  public price_quote_id!: number;
  public customer_name!: string;
  public customer_contact!: string;
  public customer_contact2?: string;

  static initModel(sequelize: Sequelize) {
    Cliente.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      price_quote_id: DataTypes.INTEGER,
      customer_name: DataTypes.STRING(200),
      customer_contact: DataTypes.STRING(200),
      customer_contact2: DataTypes.STRING(200)
    }, {
      sequelize,
      tableName: 'cliente',
      timestamps: false
    });
  }

  static associate(models: any) {
    Cliente.belongsTo(models.Cotizacion, { foreignKey: 'price_quote_id' });
    Cliente.hasMany(models.Persona, { foreignKey: 'id_client' });
  }
}
