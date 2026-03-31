import type { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import db from '@/models/index-simple';

// ── Paths & constants ─────────────────────────────────────────────────────────
const PUBLIC      = path.join(process.cwd(), 'public');
const LOGO_PATH   = path.join(PUBLIC, 'assets/images/logos/logo-lobato-2.jpg');
const AIRLINE_DIR = path.join(PUBLIC, 'assets/images/airlines');
const CRUISE_DIR  = path.join(PUBLIC, 'assets/images/cruises');
const FONT_DIR    = path.join(PUBLIC, 'assets/fonts');

const FONT_REG    = path.join(FONT_DIR, 'Sans-Regular.ttf');
const FONT_BOLD   = path.join(FONT_DIR, 'Sans-Bold.ttf');
const FONT_ITALIC = path.join(FONT_DIR, 'Sans-Italic.ttf');

const DARK  = '#1B2A4A';
const GRAY  = '#777777';
const LGRAY = '#DEDEDE';
const BGRAY = '#F5F5F5';

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const FOOTER_ADDR  = 'AV PASEO CENTENARIO No. 9211 MOD 6 LOCAL 15 C.C. PUEBLO AMIGO. CP 22010 TIJUANA, B.C.';
const FOOTER_PHONE = '\u260E 664-682-82-75  \u260E USA 619-730-3578  \u260E 664 350 6767  \u2709 lobatotours@gmail.com';

// ── Layout constants ──────────────────────────────────────────────────────────
const PAGE_H = 792;
const PAGE_W = 612;
const M      = 54;          // left/right margin
const W      = PAGE_W - 2 * M;
const FOOTER_Y = PAGE_H - 52;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(s: string | null | undefined): string {
  if (!s) return '';
  const d = new Date(s);
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtMoney(n: unknown, dollar: boolean): string {
  const num = Number(n) || 0;
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(num);
  return dollar ? `$${formatted} USD` : `$${formatted} MXN`;
}

function airlineImg(airline: string): string | null {
  const key = airline.toLowerCase().trim().replace(/\s+/g, '-');
  const map: Record<string, string> = {
    aeromexico:      'aeromexico.jpeg',
    volaris:         'volaris.jpeg',
    'viva-aerobus':  'viva-aerobus.jpeg',
    'viva aerobus':  'viva-aerobus.jpeg',
  };
  const file = map[key];
  if (!file) return null;
  const p = path.join(AIRLINE_DIR, file);
  return fs.existsSync(p) ? p : null;
}

function cruiseImg(cruiseLine: string): string | null {
  const key = cruiseLine.toLowerCase().trim();
  const map: Record<string, string> = {
    'royal-caribbean': 'royal-caribbean.jpeg',
    'royal caribbean': 'royal-caribbean.jpeg',
    norwegian:         'norwegian.jpeg',
    princess:          'princess.jpeg',
  };
  const file = map[key];
  if (!file) return null;
  const p = path.join(CRUISE_DIR, file);
  return fs.existsSync(p) ? p : null;
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

/** Draw logo at top-left; returns Y position below logo */
function drawLogo(doc: PDFKit.PDFDocument): number {
  const logoH = 52;
  const logoW = 104; // 400/200 = 2:1 aspect ratio
  const logoY = M;
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, M, logoY, { width: logoW, height: logoH });
  } else {
    doc.font(FONT_BOLD).fontSize(20).fillColor(DARK)
       .text('LOBATO TOURS', M, logoY);
  }
  return logoY + logoH + 10;
}

/** Thin horizontal rule */
function sep(doc: PDFKit.PDFDocument) {
  doc.moveDown(0.25);
  doc.moveTo(M, doc.y).lineTo(M + W, doc.y)
     .strokeColor(LGRAY).lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

/** Footer on both pages */
function drawFooter(doc: PDFKit.PDFDocument, pageNum: number) {
  // Force cursor above FOOTER_Y so PDFKit stays on this page
  doc.y = FOOTER_Y - 10;

  doc.moveTo(M, FOOTER_Y - 6).lineTo(M + W, FOOTER_Y - 6)
     .strokeColor(LGRAY).lineWidth(0.5).stroke();

  doc.font(FONT_REG).fontSize(7).fillColor(GRAY)
     .text(FOOTER_ADDR, M, FOOTER_Y, { width: W, align: 'center', lineBreak: false });
  doc.font(FONT_REG).fontSize(7).fillColor(GRAY)
     .text(FOOTER_PHONE, M, FOOTER_Y + 11, { width: W, align: 'center', lineBreak: false });

  // Rotated page number — drawn with canvas primitives to avoid cursor side-effects
  doc.save();
  doc.translate(PAGE_W - 20, FOOTER_Y - 28);
  doc.rotate(-90);
  doc.font(FONT_REG).fontSize(8).fillColor(GRAY)
     .text(`P\u00e1gina ${pageNum}`, 0, 0, { lineBreak: false });
  doc.restore();

  // Reset cursor so nothing after this triggers a new page
  doc.y = FOOTER_Y - 10;
}

/**
 * Service row — light gray background card.
 * imgPath: optional icon at left
 * label: bold text (service name/airline/etc.)
 * sub: smaller gray text below (description / breakdown detail)
 * rightAmt: right-aligned price
 */
function serviceRow(
  doc: PDFKit.PDFDocument,
  imgPath: string | null,
  label: string,
  sub: string,
  rightAmt: string,
) {
  const rowH    = 44;
  // Don't let a service row overlap the footer
  if (doc.y + rowH > FOOTER_Y - 12) return;
  const startY  = doc.y;
  const iconX   = M + 4;
  const iconSz  = 30;
  const textX   = M + iconSz + 14;
  const priceW  = 100;
  const textW   = W - (iconSz + 14) - priceW - 4;

  // Background
  doc.rect(M, startY, W, rowH).fillColor(BGRAY).fill();
  doc.moveTo(M, startY).lineTo(M + W, startY).strokeColor(LGRAY).lineWidth(0.5).stroke();

  // Icon
  if (imgPath) {
    try {
      doc.image(imgPath, iconX, startY + 7, { width: iconSz, height: iconSz });
    } catch (_) { /* skip */ }
  }

  // Label
  doc.font(FONT_BOLD).fontSize(9).fillColor(DARK)
     .text(label, textX, startY + 9, { width: textW, lineBreak: false });

  // Sub label
  if (sub) {
    doc.font(FONT_REG).fontSize(8).fillColor(GRAY)
       .text(sub, textX, startY + 22, { width: textW, lineBreak: false });
  }

  // Price (right-aligned)
  doc.font(FONT_BOLD).fontSize(10).fillColor(DARK)
     .text(rightAmt, M + W - priceW, startY + 15, { width: priceW, align: 'right', lineBreak: false });

  doc.y = startY + rowH + 4;
}

/** Render itinerary text (day-by-day) with date lines bold */
function drawItinerary(doc: PDFKit.PDFDocument, text: string) {
  const dayRe = /^(\d{1,2}\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|ene|feb|mar|abr|jun|jul|ago|sep|oct|nov|dic))/i;
  for (const line of text.split('\n')) {
    if (!line.trim()) { doc.moveDown(0.2); continue; }
    if (doc.y > FOOTER_Y - 60) { doc.addPage(); doc.y = M + 10; }
    if (dayRe.test(line.trim())) {
      doc.font(FONT_BOLD).fontSize(10).fillColor(DARK).text(line.trim(), M, doc.y, { width: W });
    } else {
      doc.font(FONT_REG).fontSize(10).fillColor(DARK).text(line.trim(), M, doc.y, { width: W });
    }
  }
}

// ── Main handler ───────────────────────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const cotId = parseInt(req.query.id as string);
  if (isNaN(cotId)) return res.status(400).json({ error: 'Invalid ID' });

  // ── Fetch all data ───────────────────────────────────────────────────────────
  const raw = await db.Cotizacion.findByPk(cotId, {
    include: [
      { model: db.Cliente,  as: 'clientes', include: [{ model: db.Persona, as: 'personas' }] },
      { model: db.Viaje,    as: 'viaje'    },
      { model: db.Vuelo,    as: 'vuelo'    },
      { model: db.Moneda,   as: 'moneda'   },
      { model: db.Crucero,  as: 'crucero'  },
      { model: db.Hotel,    as: 'hoteles',
        include: [{ model: db.Distribucion, as: 'distribuciones',
          include: [{ model: db.Habitacion, as: 'habitaciones' }] }] },
      { model: db.Traslado, as: 'traslado' },
      { model: db.Entradas, as: 'entradas' },
      { model: db.Ferry,    as: 'ferry'    },
      { model: db.Seguro,   as: 'seguro'   },
      { model: db.Datos,    as: 'datos'    },
      { model: db.Visa,     as: 'visa'     },
    ],
  }) as any;

  if (!raw) return res.status(404).json({ error: 'Not found' });

  const cot    = raw.toJSON ? raw.toJSON() : raw;
  const dollar = cot.moneda?.dollar ?? false;
  const people = (cot.clientes as any[])?.reduce((s: number, c: any) => s + (c.personas?.length || 0), 0) || 1;
  const cliente = (cot.clientes as any[])?.[0];

  // ── Cost calculation ──────────────────────────────────────────────────────────
  // Each service stores its own num_personas; fall back to total people for services without it.
  const numFor = (svc: any) => Number(svc?.num_personas) || people;

  let subtotal = 0;

  if (cot.vuelo) {
    const v = cot.vuelo;
    const vPeople = numFor(v);
    subtotal += ((Number(v.base_fee)||0) + (Number(v.iva)||0) + (Number(v.luggage_check)||0)
               + (Number(v.airport_right_of_use)||0) + (Number(v.suitcases_tax)||0)) * vPeople;
  }
  if (cot.crucero) subtotal += (Number(cot.crucero.precio) || 0) * numFor(cot.crucero);
  if (cot.ferry)   subtotal += (Number(cot.ferry.precio)   || 0) * numFor(cot.ferry);
  if (cot.entradas) {
    const en = cot.entradas;
    subtotal += (Number(en.precio) || 0) * (Number(en.cantidad) || numFor(en));
  }
  if (cot.traslado) subtotal += Number(cot.traslado.amount) || 0;
  if (cot.seguro)   subtotal += Number(cot.seguro.costo)    || 0;
  if (cot.datos)    subtotal += Number(cot.datos.costo)     || 0;
  if (cot.visa)     subtotal += Number(cot.visa.costo)      || 0;
  if (cot.viaje)    subtotal += Number(cot.viaje.package_price) || 0;

  if (cot.hoteles) {
    for (const h of cot.hoteles as any[]) {
      for (const dist of h.distribuciones || []) {
        for (const hab of dist.habitaciones || []) {
          subtotal += (Number(hab.price) || 0) + (Number(hab.iva) || 0);
        }
      }
    }
  }

  const commPct   = Number(cot.commission) || 0;
  const commAmt   = subtotal * (commPct / 100);
  const total     = subtotal + commAmt;
  const perPerson = people > 0 ? total / people : total;

  // ── INCLUYE list ─────────────────────────────────────────────────────────────
  const incluye: string[] = [];
  if (cot.vuelo) {
    const al = cot.vuelo.other_airline || cot.vuelo.airline || 'Aerolinea';
    incluye.push(`Avion Viaje Redondo ${al} con equipaje documentado`);
  }
  if (cot.hoteles?.length) {
    const h = cot.hoteles[0];
    incluye.push(`Hospedaje en ${h.name}${h.nights ? ` (${h.nights} noches)` : ''}`);
  }
  if (cot.viaje?.package_name) {
    incluye.push(`Paquete: ${cot.viaje.package_name}`);
  }
  if (cot.crucero) {
    const cl = cot.crucero.other_cruise_line || cot.crucero.cruise_line || '';
    const nombre = cot.crucero.nombre ? ` - ${cot.crucero.nombre}` : '';
    const dur    = cot.crucero.duracion ? ` (${cot.crucero.duracion} dias)` : '';
    incluye.push(`Crucero ${cl}${nombre}${dur}`);
  }
  if (cot.ferry)    incluye.push(`Ferry: ${cot.ferry.ruta || ''}`);
  if (cot.traslado) incluye.push(`Traslado${cot.traslado.tipo ? `: ${cot.traslado.tipo}` : ''}`);
  if (cot.entradas) incluye.push(`Entradas: ${cot.entradas.atraccion || 'Atracciones'}`);
  if (cot.seguro) {
    const sc = cot.seguro.other_insurance_company || cot.seguro.insurance_company || '';
    incluye.push(`Seguro de Viaje / Asistencia${sc ? ` (${sc})` : ''}`);
  }
  if (cot.datos)  incluye.push(`SIM para datos${cot.datos.proveedor_plan ? ` - ${cot.datos.proveedor_plan}` : ''}`);
  if (cot.visa)   incluye.push(`Visa${cot.visa.pais ? `: ${cot.visa.pais}` : ''}`);

  // ── Create PDF document ───────────────────────────────────────────────────────
  const doc = new PDFDocument({
    size: 'letter',
    margins: { top: M, bottom: 4, left: M, right: M },
    info: {
      Title:   `Cotizacion ${cotId} - Lobato Tours`,
      Author:  'Lobato Tours',
      Subject: cot.viaje?.travel_destiny || `Cotizacion #${cotId}`,
      Creator: 'Lobato Tours Sistema de Cotizaciones',
    },
    autoFirstPage: true,
    bufferPages: true,
  });

  // Register fonts so all Spanish characters render correctly
  doc.registerFont('Regular', FONT_REG);
  doc.registerFont('Bold',    FONT_BOLD);
  doc.registerFont('Italic',  FONT_ITALIC);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="lobato-cotizacion-${cotId}.pdf"`);
  doc.pipe(res);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — Quote / Services
  // ════════════════════════════════════════════════════════════════════════════
  const afterLogo = drawLogo(doc);
  doc.y = afterLogo;

  // ── Cotizacion number (small, above title) ───────────────────────────────
  doc.font('Regular').fontSize(9).fillColor(GRAY)
     .text(`Cotizacion #${cotId}`, M, doc.y, { align: 'center', width: W });
  doc.moveDown(0.15);

  // ── Main title: DESTINATION (big, bold, centered) ────────────────────────
  const destination = cot.viaje?.travel_destiny?.toUpperCase() || '';
  if (destination) {
    doc.font('Bold').fontSize(36).fillColor(DARK)
       .text(destination, M, doc.y, { align: 'center', width: W });
    doc.moveDown(0.1);
  }

  // ── Date range subtitle ───────────────────────────────────────────────────
  if (cot.viaje?.travel_begin || cot.viaje?.travel_end) {
    const b = cot.viaje.travel_begin as string;
    const e = cot.viaje.travel_end as string;
    let dateStr = '';
    if (b && e) {
      const bd = new Date(b), ed = new Date(e);
      if (bd.getMonth() === ed.getMonth() && bd.getFullYear() === ed.getFullYear()) {
        dateStr = `${bd.getDate()} AL ${ed.getDate()} DE ${MONTHS_ES[ed.getMonth()].toUpperCase()} ${ed.getFullYear()}`;
      } else {
        dateStr = `${fmtDate(b).toUpperCase()} - ${fmtDate(e).toUpperCase()}`;
      }
    } else {
      dateStr = fmtDate(b || e).toUpperCase();
    }
    doc.font('Bold').fontSize(13).fillColor(DARK)
       .text(dateStr, M, doc.y, { align: 'center', width: W });
    doc.moveDown(0.15);
  }

  // ── Customer name + person count ─────────────────────────────────────────
  if (cliente?.customer_name) {
    const personStr = `${people} ${people === 1 ? 'persona' : 'personas'}`;
    doc.font('Regular').fontSize(10).fillColor(GRAY)
       .text(`Para: ${cliente.customer_name}  \u2022  ${personStr}`, M, doc.y, { align: 'center', width: W });
    doc.moveDown(0.4);
  }

  sep(doc);

  // Greeting
  if (cot.greeting_message?.trim()) {
    doc.font('Italic').fontSize(10).fillColor(GRAY)
       .text(cot.greeting_message.trim(), M, doc.y, { width: W });
    doc.moveDown(0.7);
  }

  // ── VUELO ─────────────────────────────────────────────────────────────────
  if (cot.vuelo) {
    const v      = cot.vuelo;
    const al     = v.other_airline || v.airline || 'Aerolinea';
    const img    = airlineImg(v.airline || '');
    const vPpl   = numFor(v);
    const vuSub  = (Number(v.base_fee)||0) + (Number(v.iva)||0) + (Number(v.luggage_check)||0)
                 + (Number(v.airport_right_of_use)||0) + (Number(v.suitcases_tax)||0);
    const vuTotal = vuSub * vPpl;

    serviceRow(doc, img, al, 'Vuelo Ida y Vuelta', fmtMoney(vuTotal, dollar));

    // Cost breakdown line
    const parts: string[] = [];
    if (Number(v.base_fee))             parts.push(`Tarifa base: ${fmtMoney(v.base_fee, dollar)}`);
    if (Number(v.iva))                  parts.push(`IVA: ${fmtMoney(v.iva, dollar)}`);
    if (Number(v.luggage_check))        parts.push(`Equipaje: ${fmtMoney(v.luggage_check, dollar)}`);
    if (Number(v.airport_right_of_use)) parts.push(`Der. aeropuerto: ${fmtMoney(v.airport_right_of_use, dollar)}`);
    if (Number(v.suitcases_tax))        parts.push(`Imp. maletas: ${fmtMoney(v.suitcases_tax, dollar)}`);
    if (parts.length) {
      doc.font('Regular').fontSize(7.5).fillColor(GRAY)
         .text(parts.join('  '), M, doc.y, { width: W });
      doc.moveDown(0.6);
    }
  }

  // ── CRUCERO ───────────────────────────────────────────────────────────────
  if (cot.crucero) {
    const cr  = cot.crucero;
    const cl  = cr.other_cruise_line || cr.cruise_line || 'Crucero';
    const img = cruiseImg(cr.cruise_line || '');
    const nombre = cr.nombre ? ` - ${cr.nombre}` : '';
    const dur    = cr.duracion ? `${cr.duracion} dias` : '';
    const cost   = (Number(cr.precio) || 0) * numFor(cr);
    serviceRow(doc, img, `${cl}${nombre}`, dur, fmtMoney(cost, dollar));
    doc.moveDown(0.15);
  }

  // ── FERRY ─────────────────────────────────────────────────────────────────
  if (cot.ferry) {
    const fr   = cot.ferry;
    const cost = (Number(fr.precio) || 0) * numFor(fr);
    serviceRow(doc, null, `Ferry: ${fr.ruta || ''}`, fr.horario || '', fmtMoney(cost, dollar));
    doc.moveDown(0.15);
  }

  // ── TRASLADO ──────────────────────────────────────────────────────────────
  if (cot.traslado) {
    serviceRow(doc, null,
      `Traslado${cot.traslado.tipo ? `: ${cot.traslado.tipo}` : ''}`,
      '',
      fmtMoney(cot.traslado.amount, dollar),
    );
    doc.moveDown(0.15);
  }

  // ── ENTRADAS ──────────────────────────────────────────────────────────────
  if (cot.entradas) {
    const en   = cot.entradas;
    const qty  = Number(en.cantidad) || numFor(en);
    const cost = (Number(en.precio) || 0) * qty;
    serviceRow(doc, null,
      `Entradas: ${en.atraccion || ''}`,
      `${qty} persona(s) x ${fmtMoney(en.precio, dollar)}`,
      fmtMoney(cost, dollar),
    );
    doc.moveDown(0.15);
  }

  // ── Package description / Itinerary ───────────────────────────────────────
  if (cot.viaje?.package_description?.trim()) {
    doc.moveDown(0.3);
    sep(doc);
    drawItinerary(doc, cot.viaje.package_description.trim());
  }

  drawFooter(doc, 1);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2 — INCLUYE / Precio
  // ════════════════════════════════════════════════════════════════════════════
  doc.addPage();
  const afterLogo2 = drawLogo(doc);
  // Small destination + date reminder at top of page 2
  if (destination) {
    doc.font('Bold').fontSize(14).fillColor(DARK)
       .text(destination, M, afterLogo2, { align: 'center', width: W });
  }
  doc.y = (destination ? afterLogo2 + 20 : afterLogo2) + 8;

  // ── INCLUYE ───────────────────────────────────────────────────────────────
  if (incluye.length > 0) {
    doc.font('Bold').fontSize(12).fillColor(DARK).text('INCLUYE:', M, doc.y);
    doc.moveDown(0.4);
    for (const item of incluye) {
      doc.font('Regular').fontSize(10).fillColor(DARK)
         .text(`\u2022  ${item}`, M + 14, doc.y, { width: W - 14 });
    }
    doc.moveDown(0.8);
  }

  // ── Hotel details ─────────────────────────────────────────────────────────
  if (cot.hoteles?.length) {
    const hotel = cot.hoteles[0];
    doc.font('Bold').fontSize(11).fillColor(DARK)
       .text(hotel.name || 'Hotel', M, doc.y);
    if (hotel.nights) {
      doc.font('Regular').fontSize(10).fillColor(GRAY)
         .text(`${hotel.nights} noches`, M, doc.y);
    }
    for (const dist of hotel.distribuciones || []) {
      for (const hab of dist.habitaciones || []) {
        const habTotal = (Number(hab.price) || 0) + (Number(hab.iva) || 0);
        const habPpl   = Number(hab.number_of_people) || 1;
        doc.font('Regular').fontSize(9.5).fillColor(DARK)
           .text(
             `${hab.type || 'Habitacion'}  \u2022  ${habPpl} persona(s)  \u2022  ${fmtMoney(habTotal, dollar)}`,
             M, doc.y, { width: W },
           );
      }
    }
    doc.moveDown(0.8);
  }

  // ── NO INCLUYE ────────────────────────────────────────────────────────────
  doc.font('Bold').fontSize(12).fillColor(DARK).text('NO INCLUYE:', M, doc.y);
  doc.moveDown(0.4);
  doc.font('Regular').fontSize(10).fillColor(DARK)
     .text('\u2022  Tours Opcionales.', M + 14, doc.y, { width: W - 14 });
  doc.font('Regular').fontSize(10).fillColor(DARK)
     .text('\u2022  Propinas', M + 14, doc.y, { width: W - 14 });
  doc.moveDown(1.4);

  // ── PRECIO POR PERSONA ────────────────────────────────────────────────────
  doc.font('Bold').fontSize(16).fillColor(DARK)
     .text(`PRECIO POR PERSONA: ${fmtMoney(perPerson, dollar)}`, M, doc.y, { align: 'center', width: W });
  doc.moveDown(0.2);

  // Occupancy sub-line
  const roomType = cot.hoteles?.[0]?.distribuciones?.[0]?.habitaciones?.[0]?.type || '';
  const occLine  = roomType
    ? `Cotizado en Ocupacion ${roomType}. / No reembolsable`
    : `Cotizado para ${people} persona(s). / No reembolsable`;
  doc.font('Regular').fontSize(9.5).fillColor(GRAY)
     .text(occLine, M, doc.y, { align: 'center', width: W });
  if (commPct > 0) {
    doc.font('Regular').fontSize(9).fillColor(GRAY)
       .text(`Incluye ${commPct}% de comision`, M, doc.y, { align: 'center', width: W });
  }
  doc.moveDown(1.4);

  // ── Disclaimer box ────────────────────────────────────────────────────────
  const boxY = doc.y;
  const boxH = 38;
  doc.rect(M, boxY, W, boxH).fillColor('#F0F0F0').fill();
  doc.rect(M, boxY, W, boxH).strokeColor(LGRAY).lineWidth(0.5).stroke();
  doc.font('Bold').fontSize(8).fillColor(DARK)
     .text(
       'TARIFAS SUJETAS A CAMBIO SIN PREVIO AVISO. TARIFA NO SE GARANTIZA HASTA REALIZAR UN ANTICIPO',
       M + 8, boxY + 8, { width: W - 16, align: 'center' },
     );
  doc.font('Regular').fontSize(7.5).fillColor(DARK)
     .text(
       'TARIFA PAGADERA EN MONEDA NACIONAL AL TIPO DE CAMBIO BANCARIO DEL DIA',
       M + 8, doc.y + 2, { width: W - 16, align: 'center' },
     );
  doc.y = boxY + boxH + 14;

  // ── Atento Aviso ──────────────────────────────────────────────────────────
  doc.font('Bold').fontSize(9).fillColor(DARK)
     .text('Atento Aviso: ', M, doc.y, { continued: true, width: W });
  doc.font('Regular').fontSize(9).fillColor(DARK)
     .text(
       'Favor de revisar el vencimiento de su Pasaporte y Visa. Para Viajes Internacionales y Cruceros, '
       + 'se requiere que el Pasaporte tenga 6 meses de vigencia como minimo, a partir de la fecha de regreso del viaje.',
       { width: W },
     );
  doc.moveDown(0.9);

  // ── Goodbye message ───────────────────────────────────────────────────────
  if (cot.goodbye_message?.trim()) {
    doc.font('Italic').fontSize(10).fillColor(GRAY)
       .text(cot.goodbye_message.trim(), M, doc.y, { width: W });
  }

  drawFooter(doc, 2);

  doc.end();
}
