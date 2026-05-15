const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL – Railway setter DATABASE_URL automatisk
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Admin-passord – sett ADMIN_PASSWORD i Railway environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Opprett tabell ved oppstart
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bestillinger (
      id SERIAL PRIMARY KEY,
      fornavn TEXT NOT NULL,
      etternavn TEXT NOT NULL,
      telefon TEXT NOT NULL,
      epost TEXT NOT NULL,
      adresse TEXT,
      tjeneste TEXT,
      boligtype TEXT,
      storrelse TEXT,
      melding TEXT,
      status TEXT DEFAULT 'Ny',
      opprettet TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Database klar ✓');
}

// --- API: Ta imot bestilling ---
app.post('/api/bestill', async (req, res) => {
  const { fornavn, etternavn, telefon, epost, adresse, tjeneste, boligtype, storrelse, melding } = req.body;

  if (!fornavn || !etternavn || !telefon || !epost) {
    return res.status(400).json({ ok: false, error: 'Mangler påkrevde felt' });
  }

  try {
    await pool.query(
      `INSERT INTO bestillinger (fornavn, etternavn, telefon, epost, adresse, tjeneste, boligtype, storrelse, melding)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [fornavn, etternavn, telefon, epost, adresse, tjeneste, boligtype, storrelse, melding]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Databasefeil' });
  }
});

// --- Admin: Hent alle bestillinger (krever passord) ---
app.get('/api/admin/bestillinger', async (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Feil passord' });
  }
  try {
    const result = await pool.query('SELECT * FROM bestillinger ORDER BY opprettet DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefeil' });
  }
});

// --- Admin: Oppdater status ---
app.patch('/api/admin/bestillinger/:id', async (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Feil passord' });
  }
  const { status } = req.body;
  try {
    await pool.query('UPDATE bestillinger SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Databasefeil' });
  }
});

// --- Admin: Slett bestilling ---
app.delete('/api/admin/bestillinger/:id', async (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Feil passord' });
  }
  try {
    await pool.query('DELETE FROM bestillinger WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Databasefeil' });
  }
});

// Serve index og admin
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

initDB().then(() => {
  app.listen(PORT, () => console.log(`Bare Takst kjører på port ${PORT}`));
}).catch(err => {
  console.error('Kunne ikke koble til database:', err.message);
  process.exit(1);
});
