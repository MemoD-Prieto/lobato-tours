/**
 * Script to create 20+ test quotes with different table combinations
 * Run with: node scripts/create-test-quotes.js
 */

const http = require('http');

const API_URL = 'http://localhost:3000/api/quotes';

// Helper function to make POST requests
function createQuote(quoteData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(quoteData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/quotes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          if (!body || body.trim() === '') {
            reject(new Error(`Empty response (HTTP ${res.statusCode})`));
            return;
          }
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${result.error || body.substring(0, 200)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error (HTTP ${res.statusCode}): ${body.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('Connection refused - Is the Next.js server running on port 3000?'));
      } else {
        reject(error);
      }
    });
    req.write(data);
    req.end();
  });
}

// Generate random data helpers
function randomName() {
  const names = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Carmen', 'Miguel', 'Sofia'];
  const surnames = ['Garcia', 'Rodriguez', 'Lopez', 'Martinez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores'];
  return `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
}

function randomEmail(name) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  return `${name.toLowerCase().replace(' ', '.')}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

function randomPhone() {
  return `+52 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

function randomDate(start, days) {
  const date = new Date(start);
  date.setDate(date.getDate() + Math.floor(Math.random() * days));
  return date.toISOString().split('T')[0];
}

// Define all quote combinations
const quoteCombinations = [
  // 1. Only Cliente with Personas
  {
    name: 'Quote 1: Cliente + Personas',
    data: {
      cotizacion: {
        transfers: 500,
        greeting_message: 'Bienvenido a tu viaje',
        goodbye_message: 'Gracias por viajar con nosotros',
        insurance: 0,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone(),
        customer_contact2: randomEmail(randomName()),
        personas: [
          { age_range: 2 },
          { age_range: 1 }
        ]
      }]
    }
  },

  // 2. Cliente + Viaje
  {
    name: 'Quote 2: Cliente + Viaje',
    data: {
      cotizacion: {
        transfers: 300,
        greeting_message: 'Disfruta tu viaje',
        insurance: 200,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      viaje: {
        travel_destiny: 'Cancún, México',
        travel_begin: randomDate(new Date(), 30),
        travel_end: randomDate(new Date(), 37)
      }
    }
  },

  // 3. Cliente + Vuelo
  {
    name: 'Quote 3: Cliente + Vuelo',
    data: {
      cotizacion: {
        transfers: 400,
        insurance: 150,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      vuelo: {
        airline: 'aeromexico',
        base_fee: 5000,
        iva: 800,
        luggage_check: 500,
        airport_right_of_use: 200,
        suitcases_tax: 300
      }
    }
  },

  // 4. Cliente + Moneda
  {
    name: 'Quote 4: Cliente + Moneda',
    data: {
      cotizacion: {
        transfers: 250,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      moneda: {
        dollar: true,
        exchange_rate: 20.5
      }
    }
  },

  // 5. Cliente + Hotel (simple)
  {
    name: 'Quote 5: Cliente + Hotel',
    data: {
      cotizacion: {
        transfers: 600,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      hoteles: [{
        name: 'Hotel Riu Palace',
        nights: 3
      }]
    }
  },

  // 6. Cliente + Viaje + Vuelo
  {
    name: 'Quote 6: Cliente + Viaje + Vuelo',
    data: {
      cotizacion: {
        transfers: 700,
        insurance: 300,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone(),
        personas: [{ age_range: 2 }]
      }],
      viaje: {
        travel_destiny: 'París, Francia',
        travel_begin: randomDate(new Date(), 60),
        travel_end: randomDate(new Date(), 67)
      },
      vuelo: {
        airline: 'other',
        other_airline: 'Air France',
        base_fee: 12000,
        iva: 1920,
        luggage_check: 800,
        airport_right_of_use: 400,
        suitcases_tax: 600
      }
    }
  },

  // 7. Cliente + Viaje + Moneda
  {
    name: 'Quote 7: Cliente + Viaje + Moneda',
    data: {
      cotizacion: {
        transfers: 450,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      viaje: {
        travel_destiny: 'Barcelona, España',
        travel_begin: randomDate(new Date(), 45),
        travel_end: randomDate(new Date(), 52)
      },
      moneda: {
        dollar: false,
        exchange_rate: 18.2
      }
    }
  },

  // 8. Cliente + Vuelo + Moneda
  {
    name: 'Quote 8: Cliente + Vuelo + Moneda',
    data: {
      cotizacion: {
        transfers: 550,
        insurance: 250,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      vuelo: {
        airline: 'volaris',
        base_fee: 3500,
        iva: 560,
        luggage_check: 300,
        airport_right_of_use: 150,
        suitcases_tax: 200
      },
      moneda: {
        dollar: true,
        exchange_rate: 19.8
      }
    }
  },

  // 9. Cliente + Hotel + Distribucion
  {
    name: 'Quote 9: Cliente + Hotel + Distribucion',
    data: {
      cotizacion: {
        transfers: 800,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      hoteles: [{
        name: 'Grand Fiesta Americana',
        nights: 5,
        distribuciones: [{}]
      }]
    }
  },

  // 10. Cliente + Hotel + Distribucion + Habitacion
  {
    name: 'Quote 10: Cliente + Hotel + Distribucion + Habitacion',
    data: {
      cotizacion: {
        transfers: 900,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      hoteles: [{
        name: 'Secrets The Vine',
        nights: 4,
        distribuciones: [{
          habitaciones: [{
            type: 'Standard',
            number_of_people: 2,
            price: 2000,
            iva: 320
          }]
        }]
      }]
    }
  },

  // 11. Cliente + Viaje + Hotel
  {
    name: 'Quote 11: Cliente + Viaje + Hotel',
    data: {
      cotizacion: {
        transfers: 750,
        insurance: 350,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone(),
        personas: [
          { age_range: 2 },
          { age_range: 0 }
        ]
      }],
      viaje: {
        travel_destiny: 'Riviera Maya, México',
        travel_begin: randomDate(new Date(), 20),
        travel_end: randomDate(new Date(), 27)
      },
      hoteles: [{
        name: 'Hard Rock Hotel',
        nights: 7
      }]
    }
  },

  // 12. Cliente + Vuelo + Hotel
  {
    name: 'Quote 12: Cliente + Vuelo + Hotel',
    data: {
      cotizacion: {
        transfers: 650,
        insurance: 200,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      vuelo: {
        airline: 'viva-aerobus',
        base_fee: 2800,
        iva: 448,
        luggage_check: 250,
        airport_right_of_use: 120,
        suitcases_tax: 180
      },
      hoteles: [{
        name: 'Iberostar Selection',
        nights: 6,
        distribuciones: [{
          habitaciones: [{
            type: 'Ocean View',
            number_of_people: 2,
            price: 3500,
            iva: 560
          }]
        }]
      }]
    }
  },

  // 13. Cliente + Viaje + Vuelo + Moneda
  {
    name: 'Quote 13: Cliente + Viaje + Vuelo + Moneda',
    data: {
      cotizacion: {
        transfers: 850,
        insurance: 400,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone(),
        personas: [{ age_range: 1 }]
      }],
      viaje: {
        travel_destiny: 'Roma, Italia',
        travel_begin: randomDate(new Date(), 90),
        travel_end: randomDate(new Date(), 97)
      },
      vuelo: {
        airline: 'other',
        other_airline: 'Alitalia',
        base_fee: 15000,
        iva: 2400,
        luggage_check: 1000,
        airport_right_of_use: 500,
        suitcases_tax: 750
      },
      moneda: {
        dollar: false,
        exchange_rate: 20.1
      }
    }
  },

  // 14. Cliente + Viaje + Hotel + Moneda
  {
    name: 'Quote 14: Cliente + Viaje + Hotel + Moneda',
    data: {
      cotizacion: {
        transfers: 950,
        insurance: 450,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      viaje: {
        travel_destiny: 'Tokio, Japón',
        travel_begin: randomDate(new Date(), 120),
        travel_end: randomDate(new Date(), 127)
      },
      hoteles: [{
        name: 'Park Hyatt Tokyo',
        nights: 7
      }],
      moneda: {
        dollar: true,
        exchange_rate: 110.5
      }
    }
  },

  // 15. Cliente + Vuelo + Hotel + Moneda
  {
    name: 'Quote 15: Cliente + Vuelo + Hotel + Moneda',
    data: {
      cotizacion: {
        transfers: 1000,
        insurance: 500,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone(),
        personas: [
          { age_range: 2 },
          { age_range: 2 }
        ]
      }],
      vuelo: {
        airline: 'other',
        other_airline: 'Japan Airlines',
        base_fee: 18000,
        iva: 2880,
        luggage_check: 1200,
        airport_right_of_use: 600,
        suitcases_tax: 900
      },
      hoteles: [{
        name: 'Conrad Tokyo',
        nights: 5,
        distribuciones: [{
          habitaciones: [{
            type: 'Deluxe',
            number_of_people: 2,
            price: 5000,
            iva: 800
          }]
        }]
      }],
      moneda: {
        dollar: true,
        exchange_rate: 109.8
      }
    }
  },

  // 16. Multiple Clientes + Viaje
  {
    name: 'Quote 16: Multiple Clientes + Viaje',
    data: {
      cotizacion: {
        transfers: 1200,
        insurance: 600,
        finished: false
      },
      clientes: [
        {
          customer_name: randomName(),
          customer_contact: randomPhone(),
          personas: [{ age_range: 2 }]
        },
        {
          customer_name: randomName(),
          customer_contact: randomPhone(),
          personas: [{ age_range: 1 }]
        }
      ],
      viaje: {
        travel_destiny: 'Londres, Reino Unido',
        travel_begin: randomDate(new Date(), 75),
        travel_end: randomDate(new Date(), 82)
      }
    }
  },

  // 17. Cliente + Multiple Hoteles
  {
    name: 'Quote 17: Cliente + Multiple Hoteles',
    data: {
      cotizacion: {
        transfers: 1100,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone()
      }],
      hoteles: [
        {
          name: 'Hotel 1: Riu Palace',
          nights: 3,
          distribuciones: [{
            habitaciones: [{
              type: 'Standard',
              number_of_people: 2,
              price: 1500,
              iva: 240
            }]
          }]
        },
        {
          name: 'Hotel 2: Secrets',
          nights: 4,
          distribuciones: [{
            habitaciones: [{
              type: 'Junior Suite',
              number_of_people: 2,
              price: 2500,
              iva: 400
            }]
          }]
        }
      ]
    }
  },

  // 18. Cliente + Viaje + Vuelo + Hotel
  {
    name: 'Quote 18: Cliente + Viaje + Vuelo + Hotel',
    data: {
      cotizacion: {
        transfers: 1300,
        insurance: 550,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone(),
        personas: [
          { age_range: 2 },
          { age_range: 1 },
          { age_range: 0 }
        ]
      }],
      viaje: {
        travel_destiny: 'Nueva York, USA',
        travel_begin: randomDate(new Date(), 50),
        travel_end: randomDate(new Date(), 57)
      },
      vuelo: {
        airline: 'other',
        other_airline: 'American Airlines',
        base_fee: 8000,
        iva: 1280,
        luggage_check: 600,
        airport_right_of_use: 300,
        suitcases_tax: 450
      },
      hoteles: [{
        name: 'Marriott Times Square',
        nights: 7,
        distribuciones: [{
          habitaciones: [{
            type: 'City View',
            number_of_people: 3,
            price: 4000,
            iva: 640
          }]
        }]
      }]
    }
  },

  // 19. Cliente + Viaje + Vuelo + Hotel + Moneda
  {
    name: 'Quote 19: Cliente + Viaje + Vuelo + Hotel + Moneda',
    data: {
      cotizacion: {
        transfers: 1400,
        insurance: 600,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone(),
        personas: [{ age_range: 2 }]
      }],
      viaje: {
        travel_destiny: 'Dubai, UAE',
        travel_begin: randomDate(new Date(), 100),
        travel_end: randomDate(new Date(), 107)
      },
      vuelo: {
        airline: 'other',
        other_airline: 'Emirates',
        base_fee: 20000,
        iva: 3200,
        luggage_check: 1500,
        airport_right_of_use: 750,
        suitcases_tax: 1125
      },
      hoteles: [{
        name: 'Burj Al Arab',
        nights: 5,
        distribuciones: [{
          habitaciones: [{
            type: 'Suite',
            number_of_people: 2,
            price: 8000,
            iva: 1280
          }]
        }]
      }],
      moneda: {
        dollar: true,
        exchange_rate: 3.67
      }
    }
  },

  // 20. Cliente + Multiple Personas + Viaje + Vuelo
  {
    name: 'Quote 20: Cliente + Multiple Personas + Viaje + Vuelo',
    data: {
      cotizacion: {
        transfers: 1500,
        insurance: 700,
        finished: false
      },
      clientes: [{
        customer_name: randomName(),
        customer_contact: randomPhone(),
        personas: [
          { age_range: 2 },
          { age_range: 2 },
          { age_range: 1 },
          { age_range: 0 }
        ]
      }],
      viaje: {
        travel_destiny: 'Bali, Indonesia',
        travel_begin: randomDate(new Date(), 110),
        travel_end: randomDate(new Date(), 117)
      },
      vuelo: {
        airline: 'other',
        other_airline: 'Garuda Indonesia',
        base_fee: 16000,
        iva: 2560,
        luggage_check: 1300,
        airport_right_of_use: 650,
        suitcases_tax: 975
      }
    }
  },

  // 21. COMPLETE QUOTE WITH ALL TABLES
  {
    name: 'Quote 21: COMPLETE - All Tables',
    data: {
      cotizacion: {
        transfers: 2000,
        greeting_message: 'Bienvenido a tu viaje de ensueño',
        goodbye_message: 'Gracias por elegirnos, esperamos verte pronto',
        insurance: 800,
        data_plan: 500,
        visa: 300,
        commission: 1500,
        messages: 'Mensaje especial para el cliente',
        pre_travel_itinerary: 'Itinerario previo al viaje con todos los detalles',
        jacket: 150,
        tickets: 500,
        snacks: 200,
        guide: 800,
        ticketholder: 100,
        finished: true
      },
      clientes: [
        {
          customer_name: randomName(),
          customer_contact: randomPhone(),
          customer_contact2: randomEmail(randomName()),
          personas: [
            { age_range: 2 },
            { age_range: 2 },
            { age_range: 1 }
          ]
        },
        {
          customer_name: randomName(),
          customer_contact: randomPhone(),
          personas: [
            { age_range: 2 },
            { age_range: 0 }
          ]
        }
      ],
      viaje: {
        travel_destiny: 'Maldivas - Paraíso en la Tierra',
        travel_begin: randomDate(new Date(), 30),
        travel_end: randomDate(new Date(), 37),
        package_name: 'Paquete Premium Maldivas',
        package_price: 50000,
        package_description: 'Incluye: vuelos, hoteles, traslados, desayunos, cenas, excursiones y seguro de viaje'
      },
      vuelo: {
        airline: 'aeromexico',
        other_airline: 'Emirates (conexión)',
        base_fee: 25000,
        iva: 4000,
        luggage_check: 2000,
        airport_right_of_use: 1000,
        suitcases_tax: 1500
      },
      moneda: {
        dollar: true,
        exchange_rate: 3.64
      },
      hoteles: [
        {
          name: 'Conrad Maldives Rangali Island',
          nights: 4,
          distribuciones: [
            {
              habitaciones: [
                {
                  type: 'Water Villa',
                  number_of_people: 2,
                  price: 12000,
                  iva: 1920
                },
                {
                  type: 'Beach Villa',
                  number_of_people: 2,
                  price: 8000,
                  iva: 1280
                }
              ]
            }
          ]
        },
        {
          name: 'Four Seasons Resort Maldives',
          nights: 3,
          distribuciones: [
            {
              habitaciones: [
                {
                  type: 'Overwater Villa',
                  number_of_people: 3,
                  price: 15000,
                  iva: 2400
                }
              ]
            }
          ]
        }
      ]
    }
  }
];

// Main execution
async function main() {
  console.log('🚀 Starting to create test quotes...\n');
  
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < quoteCombinations.length; i++) {
    const quote = quoteCombinations[i];
    console.log(`Creating ${quote.name}...`);
    
    try {
      const result = await createQuote(quote.data);
      successCount++;
      results.push({
        name: quote.name,
        status: 'success',
        id: result.data?.id,
        message: result.message
      });
      console.log(`✅ Success! Quote ID: ${result.data?.id}\n`);
    } catch (error) {
      failCount++;
      results.push({
        name: quote.name,
        status: 'failed',
        error: error.message
      });
      console.log(`❌ Failed: ${error.message}\n`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total quotes: ${quoteCombinations.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('\nDetailed results:');
  results.forEach((r, i) => {
    if (r.status === 'success') {
      console.log(`  ${i + 1}. ${r.name} - ID: ${r.id}`);
    } else {
      console.log(`  ${i + 1}. ${r.name} - ERROR: ${r.error}`);
    }
  });
}

// Run the script
main().catch(console.error);

