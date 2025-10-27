// Database connection test endpoint
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Testing database connection...');
      
      // Test direct PostgreSQL connection
      const { Client } = require('pg');
      const client = new Client({
        host: 'localhost',
        port: 5430,
        database: 'mydatabase',
        user: 'postgres',
        password: 'postgres'
      });

      await client.connect();
      console.log('✅ Database connection successful!');
      
      // Test a simple query
      const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
      await client.end();
      
      res.status(200).json({
        ok: true,
        message: 'Database connection successful!',
        database: {
          connected: true,
          currentTime: result.rows[0].current_time,
          version: result.rows[0].postgres_version
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Database connection error:', error);
      res.status(500).json({
        ok: false,
        error: error.message,
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
