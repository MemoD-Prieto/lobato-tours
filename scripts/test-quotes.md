# Test Quotes Script

This script creates 21 test quotes with different table combinations to test the `/api/quotes` endpoint.

## Prerequisites

1. **Start the database:**
   ```bash
   docker-compose up -d
   ```

2. **Initialize the database:**
   ```bash
   curl -X POST http://localhost:3000/api/init
   ```
   Or if the server is running:
   ```bash
   npm run init-db
   ```

3. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

## Running the Script

Once the server is running on port 3000, execute:

```bash
node scripts/create-test-quotes.js
```

## What the Script Creates

The script creates 21 quotes with the following combinations:

1. Cliente + Personas
2. Cliente + Viaje
3. Cliente + Vuelo
4. Cliente + Moneda
5. Cliente + Hotel
6. Cliente + Viaje + Vuelo
7. Cliente + Viaje + Moneda
8. Cliente + Vuelo + Moneda
9. Cliente + Hotel + Distribucion
10. Cliente + Hotel + Distribucion + Habitacion
11. Cliente + Viaje + Hotel
12. Cliente + Vuelo + Hotel
13. Cliente + Viaje + Vuelo + Moneda
14. Cliente + Viaje + Hotel + Moneda
15. Cliente + Vuelo + Hotel + Moneda
16. Multiple Clientes + Viaje
17. Cliente + Multiple Hoteles
18. Cliente + Viaje + Vuelo + Hotel
19. Cliente + Viaje + Vuelo + Hotel + Moneda
20. Cliente + Multiple Personas + Viaje + Vuelo
21. **COMPLETE QUOTE** - All tables combined (Cliente, Personas, Viaje, Vuelo, Moneda, Hoteles, Distribuciones, Habitaciones)

## Expected Output

The script will output:
- Progress for each quote creation
- Success/failure status
- Quote IDs for successful creations
- A summary at the end with total counts

## Troubleshooting

- **Connection refused**: Make sure the Next.js server is running on port 3000
- **Database errors**: Ensure the database is initialized and running
- **Foreign key errors**: Check that the database tables match the models exactly


