// Database initialization endpoint using TypeScript models with correct table names
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../models/index';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🚀 Starting database initialization...');
      
      // Ensure Sequelize is ready
      await db.sequelize.authenticate();
      console.log('✅ Database connection established');

      // Sync all models (create tables if they don't exist)
      // Using force: false to preserve existing data, but you can set to true to drop and recreate
      await db.sequelize.sync({ force: false });
      console.log('✅ All tables synchronized');

      // Get table information to verify
      const tables = await db.sequelize.getQueryInterface().showAllTables();
      console.log('📊 Available tables:', tables);

      // Check if any users exist
      const existingUsers = await db.Empleado.count();
      
      if (existingUsers === 0) {
        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const defaultUser = await db.Empleado.create({
          user_name: 'admin',
          real_name: 'Administrador',
          password_hash: Buffer.from(hashedPassword),
          salt: 'default-salt',
          creation_date: new Date(),
          last_accessed: null,
          type: 1, // Admin type
          active: 1
        });
        
        console.log('✅ Default admin user created');
        console.log('📧 Username: admin');
        console.log('🔑 Password: admin123');
      } else {
        console.log('ℹ️ Users already exist, skipping user creation');
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

    } catch (error: any) {
      console.error('❌ Initialization error:', error);
      res.status(500).json({
        ok: false,
        error: error?.message ?? String(error),
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
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

    } catch (error: any) {
      res.status(500).json({
        ok: false,
        error: error?.message ?? String(error),
        status: 'disconnected'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


