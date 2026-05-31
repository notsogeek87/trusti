import 'dotenv/config';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const { email } = req.query;
  if (!email) return res.status(400).json({ isAdmin: false });

  const cleanEmail = email.toLowerCase().trim();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  // Dev bypass si ADMIN_EMAIL non défini
  const isAdmin = !adminEmail || cleanEmail === adminEmail;
  return res.status(200).json({ isAdmin });
}
