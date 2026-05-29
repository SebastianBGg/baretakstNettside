const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
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

    await resend.emails.send({
      from: 'bestilling@baretakst.no',
      to: process.env.NOTIFY_EMAIL,
      subject: `Ny bestilling fra ${fornavn} ${etternavn}`,
      html: `
        <h2>Ny bestilling – Bare Takst</h2>
        <p><b>Navn:</b> ${fornavn} ${etternavn}</p>
        <p><b>Telefon:</b> ${telefon}</p>
        <p><b>E-post:</b> ${epost}</p>
        <p><b>Adresse:</b> ${adresse || '–'}</p>
        <p><b>Tjeneste:</b> ${tjeneste || '–'}</p>
        <p><b>Boligtype:</b> ${boligtype || '–'}</p>
        <p><b>Størrelse:</b> ${storrelse || '–'} m²</p>
        <p><b>Melding:</b> ${melding || '–'}</p>
      `
    });

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
