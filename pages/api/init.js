// Simple initialization endpoint
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Import database models
      const db = require('../../models/index-simple.js');
      
      // Ensure Sequelize is ready
      await db.sequelize.authenticate();
      console.log('✅ Database connection established');

      // Sync all models (create tables if they don't exist)
      await db.sequelize.sync({ force: false });
      console.log('✅ All tables synchronized');

      // Check if any users exist
      const existingUsers = await db.Empleado.count();
      
      if (existingUsers === 0) {
        // Create default admin user
        const bcrypt = require('bcryptjs');
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

      // Get table information
      const tables = await db.sequelize.getQueryInterface().showAllTables();
      console.log('📊 Available tables:', tables);

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
      console.error('❌ Initialization error:', error);
      res.status(500).json({
        ok: false,
        error: error?.message ?? String(error),
        details: error?.stack
      });
    }
  } else if (req.method === 'GET') {
    try {
      // Import database models
      const db = require('../../models/index-simple.js');
      
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