'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.js').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  ...config,
  host: config.host || '127.0.0.1',
  dialect: 'postgres',
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: { connectTimeout: 10000 },
});

// ---------------------------------------------------------------------------
// Empleado
// ---------------------------------------------------------------------------
const Empleado = sequelize.define('Empleado', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_name:    { type: DataTypes.STRING,  allowNull: false, unique: true },
  real_name:    { type: DataTypes.STRING,  allowNull: false },
  email:        { type: DataTypes.STRING,  allowNull: false, unique: true },
  password:     { type: DataTypes.STRING,  allowNull: false },
  phone_number: { type: DataTypes.STRING },
  address:      { type: DataTypes.TEXT },
  role:         { type: DataTypes.STRING,  defaultValue: 'employee' },
  active:       { type: DataTypes.BOOLEAN, defaultValue: true },
  creation_date:{ type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
}, { tableName: 'empleado', timestamps: false });

// ---------------------------------------------------------------------------
// Cotizacion  (no longer stores service costs — each service has its own table)
// ---------------------------------------------------------------------------
const Cotizacion = sequelize.define('Cotizacion', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id:          { type: DataTypes.STRING,  allowNull: false },
  pre_travel_itinerary: { type: DataTypes.TEXT,    allowNull: true },
  jacket:               { type: DataTypes.INTEGER, defaultValue: 0 },
  tickets:              { type: DataTypes.INTEGER, defaultValue: 0 },
  snacks:               { type: DataTypes.INTEGER, defaultValue: 0 },
  guide:                { type: DataTypes.INTEGER, defaultValue: 0 },
  ticketholder:         { type: DataTypes.INTEGER, defaultValue: 0 },
  commission:           { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  greeting_message:     { type: DataTypes.TEXT },
  goodbye_message:      { type: DataTypes.TEXT },
  notes:                { type: DataTypes.TEXT,    allowNull: true },
  valid_until:          { type: DataTypes.DATEONLY, allowNull: true },
  finished:             { type: DataTypes.BOOLEAN, defaultValue: false },
  sold:                 { type: DataTypes.BOOLEAN, defaultValue: false },
  creation_date:        { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
}, { tableName: 'cotizacion', timestamps: false });

// ---------------------------------------------------------------------------
// Cliente
// ---------------------------------------------------------------------------
const Cliente = sequelize.define('Cliente', {
  id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id:     { type: DataTypes.INTEGER, allowNull: false },
  customer_name:     { type: DataTypes.STRING,  allowNull: false },
  customer_contact:  { type: DataTypes.STRING,  allowNull: false },
  customer_contact2: { type: DataTypes.STRING },
}, { tableName: 'cliente', timestamps: false });

// ---------------------------------------------------------------------------
// Persona
// ---------------------------------------------------------------------------
const Persona = sequelize.define('Persona', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  age_range:  { type: DataTypes.INTEGER, defaultValue: 0 },  // 0=0-2, 1=3-11, 2=12-17, 3=18+
}, { tableName: 'persona', timestamps: false });

// ---------------------------------------------------------------------------
// Moneda
// ---------------------------------------------------------------------------
const Moneda = sequelize.define('Moneda', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id: { type: DataTypes.INTEGER, allowNull: false },
  dollar:        { type: DataTypes.BOOLEAN, defaultValue: false },
  exchange_rate: { type: DataTypes.DECIMAL(10, 4), defaultValue: 0 },
}, { tableName: 'moneda', timestamps: false });

// ---------------------------------------------------------------------------
// Viaje  (paquete)
// ---------------------------------------------------------------------------
const Viaje = sequelize.define('Viaje', {
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id:       { type: DataTypes.INTEGER, allowNull: false },
  travel_destiny:      { type: DataTypes.STRING },
  travel_begin:        { type: DataTypes.DATEONLY },
  travel_end:          { type: DataTypes.DATEONLY },
  package_name:        { type: DataTypes.TEXT,    allowNull: true },
  package_description: { type: DataTypes.TEXT,    allowNull: true },
  package_price:       { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  num_personas:        { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, { tableName: 'viaje', timestamps: false });

// ---------------------------------------------------------------------------
// Vuelo
// ---------------------------------------------------------------------------
const Vuelo = sequelize.define('Vuelo', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id:        { type: DataTypes.INTEGER, allowNull: false },
  airline:              { type: DataTypes.STRING },
  other_airline:        { type: DataTypes.STRING },
  base_fee:             { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  iva:                  { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  luggage_check:        { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  airport_right_of_use: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  suitcases_tax:        { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  num_personas:         { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, { tableName: 'vuelo', timestamps: false });

// ---------------------------------------------------------------------------
// Crucero
// ---------------------------------------------------------------------------
const Crucero = sequelize.define('Crucero', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id:    { type: DataTypes.INTEGER, allowNull: false },
  cruise_line:      { type: DataTypes.STRING,  allowNull: true },
  other_cruise_line:{ type: DataTypes.STRING,  allowNull: true },
  nombre:           { type: DataTypes.STRING,  allowNull: true },
  precio:           { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  duracion:         { type: DataTypes.INTEGER, defaultValue: 0 },
  num_personas:     { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, { tableName: 'crucero', timestamps: false });

// ---------------------------------------------------------------------------
// Hotel  →  Distribucion  →  Habitacion
// ---------------------------------------------------------------------------
const Hotel = sequelize.define('Hotel', {
  id:            { type: DataTypes.INTEGER,    primaryKey: true, autoIncrement: true },
  cotizacion_id: { type: DataTypes.INTEGER,    allowNull: false },
  name:          { type: DataTypes.STRING(200) },
  nights:        { type: DataTypes.INTEGER,    defaultValue: 0 },
  num_personas:  { type: DataTypes.INTEGER,    allowNull: true, defaultValue: null },
}, { tableName: 'hotel', timestamps: false });

const Distribucion = sequelize.define('Distribucion', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hotel_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'distribucion', timestamps: false });

const Habitacion = sequelize.define('Habitacion', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  distribution_id:  { type: DataTypes.INTEGER, allowNull: false },
  client_id:        { type: DataTypes.INTEGER, allowNull: false },
  type:             { type: DataTypes.STRING },
  number_of_people: { type: DataTypes.INTEGER, defaultValue: 1 },
  price:            { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  iva:              { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
}, { tableName: 'habitacion', timestamps: false });

// ---------------------------------------------------------------------------
// Traslado
// ---------------------------------------------------------------------------
const Traslado = sequelize.define('Traslado', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo:          { type: DataTypes.STRING,  allowNull: true },
  amount:        { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  num_personas:  { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, { tableName: 'traslado', timestamps: false });

// ---------------------------------------------------------------------------
// Entradas
// ---------------------------------------------------------------------------
const Entradas = sequelize.define('Entradas', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id: { type: DataTypes.INTEGER, allowNull: false },
  atraccion:     { type: DataTypes.STRING,  allowNull: true },
  precio:        { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  cantidad:      { type: DataTypes.INTEGER, defaultValue: 0 },
  num_personas:  { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, { tableName: 'entradas', timestamps: false });

// ---------------------------------------------------------------------------
// Ferry
// ---------------------------------------------------------------------------
const Ferry = sequelize.define('Ferry', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id: { type: DataTypes.INTEGER, allowNull: false },
  ruta:          { type: DataTypes.STRING,  allowNull: true },
  precio:        { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  horario:       { type: DataTypes.STRING,  allowNull: true },
  num_personas:  { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, { tableName: 'ferry', timestamps: false });

// ---------------------------------------------------------------------------
// Seguro
// ---------------------------------------------------------------------------
const Seguro = sequelize.define('Seguro', {
  id:                       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id:            { type: DataTypes.INTEGER, allowNull: false },
  insurance_company:        { type: DataTypes.STRING,  allowNull: true },
  other_insurance_company:  { type: DataTypes.STRING,  allowNull: true },
  tipo:                     { type: DataTypes.STRING,  allowNull: true },
  costo:                    { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  num_personas:             { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, { tableName: 'seguro', timestamps: false });

// ---------------------------------------------------------------------------
// Datos  (tarjeta de datos / eSIM)
// ---------------------------------------------------------------------------
const Datos = sequelize.define('Datos', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id:  { type: DataTypes.INTEGER, allowNull: false },
  proveedor_plan: { type: DataTypes.STRING,  allowNull: true },
  inicio:         { type: DataTypes.DATEONLY, allowNull: true },
  costo:          { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  num_personas:   { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, { tableName: 'datos', timestamps: false });

// ---------------------------------------------------------------------------
// Visa
// ---------------------------------------------------------------------------
const Visa = sequelize.define('Visa', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id: { type: DataTypes.INTEGER, allowNull: false },
  pais:          { type: DataTypes.STRING,  allowNull: true },
  costo:         { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tiempo:        { type: DataTypes.STRING,  allowNull: true },
  num_personas:  { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, { tableName: 'visa', timestamps: false });

// ---------------------------------------------------------------------------
// Associations
// ---------------------------------------------------------------------------

// Cotizacion ↔ Cliente (1:N)
Cotizacion.hasMany(Cliente,  { foreignKey: 'cotizacion_id', as: 'clientes' });
Cliente.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cliente ↔ Persona (1:N)
Cliente.hasMany(Persona, { foreignKey: 'cliente_id', as: 'personas' });
Persona.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Cotizacion ↔ Moneda (1:1)
Cotizacion.hasOne(Moneda,   { foreignKey: 'cotizacion_id', as: 'moneda' });
Moneda.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion ↔ Viaje (1:1)
Cotizacion.hasOne(Viaje,   { foreignKey: 'cotizacion_id', as: 'viaje' });
Viaje.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion ↔ Vuelo (1:1)
Cotizacion.hasOne(Vuelo,   { foreignKey: 'cotizacion_id', as: 'vuelo' });
Vuelo.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion ↔ Crucero (1:1)
Cotizacion.hasOne(Crucero,   { foreignKey: 'cotizacion_id', as: 'crucero' });
Crucero.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion ↔ Hotel (1:N)
Cotizacion.hasMany(Hotel,   { foreignKey: 'cotizacion_id', as: 'hoteles' });
Hotel.belongsTo(Cotizacion,  { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Hotel ↔ Distribucion (1:N)
Hotel.hasMany(Distribucion,      { foreignKey: 'hotel_id', as: 'distribuciones' });
Distribucion.belongsTo(Hotel,    { foreignKey: 'hotel_id', as: 'hotel' });

// Distribucion ↔ Habitacion (1:N)
Distribucion.hasMany(Habitacion,    { foreignKey: 'distribution_id', as: 'habitaciones' });
Habitacion.belongsTo(Distribucion,  { foreignKey: 'distribution_id', as: 'distribucion' });

// Cliente ↔ Habitacion (1:N)
Cliente.hasMany(Habitacion,   { foreignKey: 'client_id', as: 'habitaciones' });
Habitacion.belongsTo(Cliente, { foreignKey: 'client_id', as: 'cliente' });

// Cotizacion ↔ Traslado (1:1)
Cotizacion.hasOne(Traslado,   { foreignKey: 'cotizacion_id', as: 'traslado' });
Traslado.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion ↔ Entradas (1:1)
Cotizacion.hasOne(Entradas,   { foreignKey: 'cotizacion_id', as: 'entradas' });
Entradas.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion ↔ Ferry (1:1)
Cotizacion.hasOne(Ferry,   { foreignKey: 'cotizacion_id', as: 'ferry' });
Ferry.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion ↔ Seguro (1:1)
Cotizacion.hasOne(Seguro,   { foreignKey: 'cotizacion_id', as: 'seguro' });
Seguro.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion ↔ Datos (1:1)
Cotizacion.hasOne(Datos,   { foreignKey: 'cotizacion_id', as: 'datos' });
Datos.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion ↔ Visa (1:1)
Cotizacion.hasOne(Visa,   { foreignKey: 'cotizacion_id', as: 'visa' });
Visa.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  sequelize,
  Sequelize,
  Empleado,
  Cotizacion,
  Cliente,
  Persona,
  Moneda,
  Viaje,
  Vuelo,
  Crucero,
  Hotel,
  Distribucion,
  Habitacion,
  Traslado,
  Entradas,
  Ferry,
  Seguro,
  Datos,
  Visa,
};
