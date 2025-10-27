import {
  Model, DataTypes, Sequelize, Optional
} from 'sequelize';

interface PersonaAttributes {
  id: number;
  id_client: number;
  age_range: number;
}

type PersonaCreationAttributes = Optional<PersonaAttributes, 'id'>;

export class Persona extends Model<PersonaAttributes, PersonaCreationAttributes> implements PersonaAttributes {
  public id!: number;
  public id_client!: number;
  public age_range!: number;

  static initModel(sequelize: Sequelize) {
    Persona.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_client: DataTypes.INTEGER,
      age_range: DataTypes.INTEGER
    }, {
      sequelize,
      tableName: 'persona',
      timestamps: false
    });
  }

  static associate(models: any) {
    Persona.belongsTo(models.Cliente, { foreignKey: 'id_client' });
  }
}
