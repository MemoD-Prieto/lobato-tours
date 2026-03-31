import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { Op } from 'sequelize';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await db.sequelize.authenticate();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOf7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ── Total counts ────────────────────────────────────────────────────────
    const totalCotizaciones = await db.Cotizacion.count();
    const finishedCotizaciones = await db.Cotizacion.count({ where: { finished: true } });
    const draftCotizaciones = totalCotizaciones - finishedCotizaciones;

    // ── This month ──────────────────────────────────────────────────────────
    const thisMonthCount = await db.Cotizacion.count({
      where: { creation_date: { [Op.gte]: startOfMonth } },
    });

    // ── Last month ──────────────────────────────────────────────────────────
    const lastMonthCount = await db.Cotizacion.count({
      where: {
        creation_date: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
      },
    });

    // ── Last 7 days ─────────────────────────────────────────────────────────
    const last7DaysCount = await db.Cotizacion.count({
      where: { creation_date: { [Op.gte]: startOf7Days } },
    });

    // ── Expiring soon (valid_until within next 7 days) ───────────────────────
    const expiringSoon = await db.Cotizacion.count({
      where: {
        valid_until: {
          [Op.between]: [
            now.toISOString().split('T')[0],
            new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ],
        },
        finished: false,
      },
    });

    // ── Recent quotes (last 5) ───────────────────────────────────────────────
    const recentQuotes = await db.Cotizacion.findAll({
      include: [{ model: db.Cliente, as: 'clientes', attributes: ['customer_name', 'customer_contact'] }],
      order: [['creation_date', 'DESC']],
      limit: 5,
      attributes: ['id', 'creation_date', 'finished', 'valid_until'],
    });

    // ── Monthly trend (last 6 months) ────────────────────────────────────────
    const monthlyTrend: Array<{ month: string; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const count = await db.Cotizacion.count({
        where: { creation_date: { [Op.between]: [mStart, mEnd] } },
      });
      const label = mStart.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
      monthlyTrend.push({ month: label, count });
    }

    // ── Month-over-month growth ──────────────────────────────────────────────
    const growth = lastMonthCount > 0
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : thisMonthCount > 0 ? 100 : 0;

    return res.status(200).json({
      ok: true,
      data: {
        totals: {
          all: totalCotizaciones,
          finished: finishedCotizaciones,
          draft: draftCotizaciones,
        },
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        last7Days: last7DaysCount,
        growth,
        expiringSoon,
        recentQuotes,
        monthlyTrend,
      },
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}
