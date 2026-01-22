'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.js').development;

// Create Sequelize instance with explicit IPv4 and connection pool settings
const sequelizeConfig = {
  ...config,
  host: config.host || '127.0.0.1',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // Force IPv4
    connectTimeout: 10000
  }
};

const sequelize = new Sequelize(config.database, config.username, config.password, sequelizeConfig);

// Define models directly here for simplicity
const Empleado = sequelize.define('Empleado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  real_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'employee'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  creation_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

const Cotizacion = sequelize.define('Cotizacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transfers: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  greeting_message: {
    type: DataTypes.TEXT
  },
  goodbye_message: {
    type: DataTypes.TEXT
  },
  insurance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  data_plan: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  visa: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  messages: {
    type: DataTypes.TEXT
  },
  finished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  creation_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cotizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_contact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_contact2: {
    type: DataTypes.STRING
  }
});

const Persona = sequelize.define('Persona', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  age_range: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

const Viaje = sequelize.define('Viaje', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cotizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  travel_destiny: {
    type: DataTypes.STRING
  },
  travel_begin: {
    type: DataTypes.DATE
  },
  travel_end: {
    type: DataTypes.DATE
  },
  package_name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  package_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  package_description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

const Vuelo = sequelize.define('Vuelo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cotizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  airline: {
    type: DataTypes.STRING
  },
  other_airline: {
    type: DataTypes.STRING
  },
  base_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  iva: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  luggage_check: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  airport_right_of_use: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  suitcases_tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
});

const Moneda = sequelize.define('Moneda', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cotizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dollar: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0
  }
});

const Crucero = sequelize.define('Crucero', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cotizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cruise_line: {
    type: DataTypes.STRING,
    allowNull: true
  },
  other_cruise_line: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  duracion: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'crucero',
  timestamps: false
});

const Hotel = sequelize.define('Hotel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  price_quote_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(200)
  },
  nights: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'hotel',
  timestamps: false
});

const Distribucion = sequelize.define('Distribucion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'distribucion',
  timestamps: false
});

const Habitacion = sequelize.define('Habitacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  distribution_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING
  },
  number_of_people: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  iva: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'habitacion',
  timestamps: false
});

// Define associations (without foreign key constraints for now)
// Cotizacion.belongsTo(Empleado, { foreignKey: 'employee_id', as: 'empleado' });
// Empleado.hasMany(Cotizacion, { foreignKey: 'employee_id', as: 'cotizaciones' });

Cliente.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
Cotizacion.hasMany(Cliente, { foreignKey: 'cotizacion_id', as: 'clientes' });

Persona.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Cliente.hasMany(Persona, { foreignKey: 'cliente_id', as: 'personas' });

Viaje.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
Cotizacion.hasOne(Viaje, { foreignKey: 'cotizacion_id', as: 'viaje' });

Vuelo.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
Cotizacion.hasOne(Vuelo, { foreignKey: 'cotizacion_id', as: 'vuelo' });

Moneda.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
Cotizacion.hasOne(Moneda, { foreignKey: 'cotizacion_id', as: 'moneda' });

Crucero.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
Cotizacion.hasOne(Crucero, { foreignKey: 'cotizacion_id', as: 'crucero' });

Hotel.belongsTo(Cotizacion, { foreignKey: 'price_quote_id', as: 'cotizacion' });
Cotizacion.hasMany(Hotel, { foreignKey: 'price_quote_id', as: 'hoteles' });

Distribucion.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });
Hotel.hasMany(Distribucion, { foreignKey: 'hotel_id', as: 'distribuciones' });

Habitacion.belongsTo(Distribucion, { foreignKey: 'distribution_id', as: 'distribucion' });
Distribucion.hasMany(Habitacion, { foreignKey: 'distribution_id', as: 'habitaciones' });

Habitacion.belongsTo(Cliente, { foreignKey: 'client_id', as: 'cliente' });
Cliente.hasMany(Habitacion, { foreignKey: 'client_id', as: 'habitaciones' });

module.exports = {
  sequelize,
  Sequelize,
  Empleado,
  Cotizacion,
  Cliente,
  Persona,
  Viaje,
  Vuelo,
  Moneda,
  Crucero,
  Hotel,
  Distribucion,
  Habitacion
};
