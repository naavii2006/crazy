import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { name1, name2, relationship, percent } = req.body;

    if (!name1 || !name2 || !relationship || percent == null) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO relationships (name1, name2, relationship, percent) VALUES ($1, $2, $3, $4) RETURNING *',
            [name1, name2, relationship, percent]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
