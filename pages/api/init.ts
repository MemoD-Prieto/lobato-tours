// Database initialization endpoint using TypeScript models with correct table names
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../models/index';
import dbSimple from '../../models/index-simple';
import { DataTypes, type ModelAttributeColumnOptions } from 'sequelize';
import bcrypt from 'bcryptjs';

/** Ensure all new columns exist (safe to run multiple times) */
async function runMigrations() {
  const qi = dbSimple.sequelize.getQueryInterface();
  const addIfMissing = async (table: string, column: string, def: ModelAttributeColumnOptions) => {
    try {
      const cols = await qi.describeTable(table);
      if (!cols[column]) await qi.addColumn(table, column, def);
    } catch {}
  };
  await addIfMissing('cotizacion', 'notes',       { type: DataTypes.TEXT,    allowNull: true });
  await addIfMissing('cotizacion', 'valid_until', { type: DataTypes.DATEONLY, allowNull: true });
  await addIfMissing('cotizacion', 'sold',        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Ensure Sequelize is ready
      await db.sequelize.authenticate();

      // Sync all models (create tables if they don't exist)
      // Using force: false to preserve existing data
      await db.sequelize.sync({ alter: true });

      // Run incremental column migrations for index-simple models
      await runMigrations();

      // Get table information to verify
      const tables = await db.sequelize.getQueryInterface().showAllTables();

      // Check if any users exist
      const existingUsers = await db.Empleado.count();

      if (existingUsers === 0) {
        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.Empleado.create({
          user_name: 'admin',
          real_name: 'Administrador',
          password_hash: Buffer.from(hashedPassword),
          salt: 'default-salt',
          creation_date: new Date(),
          last_accessed: null,
          type: 1, // Admin type
          active: 1
        });
      }

      res.status(200).json({
        ok: true,
        message: 'Database initialized successfully',
        tables: tables,
        userCreated: existingUsers === 0,
        defaultCredentials: existingUsers === 0 ? {
          username: 'admin',
          password: 'admin123'
        } : null
      });

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Initialization error:', err.message);
      res.status(500).json({
        ok: false,
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  } else if (req.method === 'GET') {
    try {
      // Check database status
      await db.sequelize.authenticate();

      const tables = await db.sequelize.getQueryInterface().showAllTables();
      const userCount = await db.Empleado.count();

      res.status(200).json({
        ok: true,
        status: 'connected',
        tables: tables,
        userCount: userCount,
        message: 'Database is ready'
      });

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      res.status(500).json({
        ok: false,
        error: err.message,
        status: 'disconnected'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


