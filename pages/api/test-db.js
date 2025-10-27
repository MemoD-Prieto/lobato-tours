export default async function handler(req, res) {
  try {
    console.log('Testing database connection...');
    
    // Try to import the models
    const db = require('@/models/index.ts');
    console.log('DB object:', Object.keys(db));
    
    res.status(200).json({
      ok: true,
      message: 'Database test successful',
      dbKeys: Object.keys(db)
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
      stack: error.stack
    });
  }
}
