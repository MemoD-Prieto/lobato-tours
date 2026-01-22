import { Model, DataTypes, Sequelize } from 'sequelize';

export class Comida extends Model {
  public id!: number;
  public id_hotel!: number;
  public id_person!: number;
  public breakfast!: number;
  public breakfast_iva!: number;
  public dinner!: number;
  public dinner_iva!: number;

  static initModel(sequelize: Sequelize) {
    Comida.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_hotel: DataTypes.INTEGER,
      id_person: DataTypes.INTEGER,
      breakfast: DataTypes.DECIMAL,
      breakfast_iva: DataTypes.DECIMAL,
      dinner: DataTypes.DECIMAL,
      dinner_iva: DataTypes.DECIMAL
    }, {
      sequelize,
      tableName: 'comida',
      timestamps: false
    });
  }

  static associate(models: any) {
    Comida.belongsTo(models.Hotel, { foreignKey: 'id_hotel' });
    Comida.belongsTo(models.Persona, { foreignKey: 'id_person' });
  }
}
