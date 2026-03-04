#!/bin/bash

# Database initialization script
# This script initializes the database schema on a fresh database

set -e

echo "🚀 Initializing database schema..."

# Wait for the app to be ready
echo "⏳ Waiting for application to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s -f http://localhost:3001/api/init-simple > /dev/null 2>&1; then
    echo "✅ Application is ready!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   Attempt $RETRY_COUNT/$MAX_RETRIES..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Application did not become ready in time"
  exit 1
fi

# Initialize the database
echo "📊 Initializing database schema..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/init-simple)

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Database initialized successfully!"
  echo ""
  echo "📝 Default admin credentials:"
  echo "   Username: admin"
  echo "   Password: admin123"
  echo ""
  echo "🌐 Application is ready at: http://localhost:3001"
else
  echo "❌ Database initialization failed:"
  echo "$RESPONSE"
  exit 1
fi

