// Database initialization endpoint
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('🚀 Starting database initialization...');
      
      // Import database models
      const db = require('@/models/index-simple');
      
      // Ensure Sequelize is ready
      await db.sequelize.authenticate();
      console.log('✅ Database connection established');

      // Sync all models (create tables if they don't exist)
      await db.sequelize.sync({ force: true });
      console.log('✅ All tables synchronized');

      // Check if any users exist
      const existingUsers = await db.Empleado.count();

      if (existingUsers === 0) {
        // Create default admin user
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const defaultUser = await db.Empleado.create({
          user_name: 'admin',
          real_name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          phone_number: '1234567890',
          address: '123 Admin St',
          role: 'admin',
          active: true,
          creation_date: new Date(),
        });
        console.log('✅ Default admin user created:', defaultUser.user_name);
      } else {
        console.log('ℹ️ Default admin user already exists, skipping creation.');
      }

      res.status(200).json({
        ok: true,
        message: 'Database initialized successfully!',
        tablesSynchronized: true,
        defaultUserCreated: existingUsers === 0,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Initialization error:', error);
      res.status(500).json({
        ok: false,
        error: error?.message ?? String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  } else if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      message: 'Database initialization endpoint is ready',
      methods: ['GET', 'POST'],
      timestamp: new Date().toISOString()
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
