# Bare Takst AS – Fullstack booking-system

## Struktur

```
bare_takst_app/
├── server.js          # Express-server med alle API-endepunkter
├── package.json       # Avhengigheter
├── public/
│   ├── index.html     # Nettsiden (med skjema som sender til API)
│   ├── admin.html     # Admin-panel (/admin)
│   └── logo.png       # Logo
```

## Deploy på Railway

### 1. Opprett prosjekt
- Gå til [railway.app](https://railway.app) og logg inn
- Klikk **New Project → Deploy from GitHub repo**
- Push denne mappen til et GitHub-repo, og velg det

### 2. Legg til PostgreSQL-database
- I Railway-prosjektet: klikk **+ New → Database → PostgreSQL**
- Railway setter automatisk `DATABASE_URL` i miljøvariablene til appen din

### 3. Sett miljøvariabler
Gå til appen din i Railway → **Variables** og legg til:

| Variabel | Verdi |
|----------|-------|
| `ADMIN_PASSWORD` | Velg et sterkt passord |

`DATABASE_URL` settes automatisk av Railway.

### 4. Deploy
Railway starter automatisk. Appen er klar på din Railway-URL.

## URL-er
- **Nettside:** `https://din-app.railway.app/`
- **Admin-panel:** `https://din-app.railway.app/admin`

## API-endepunkter
| Metode | Endepunkt | Beskrivelse |
|--------|-----------|-------------|
| POST | `/api/bestill` | Ta imot ny bestilling |
| GET | `/api/admin/bestillinger` | Hent alle (krever passord) |
| PATCH | `/api/admin/bestillinger/:id` | Oppdater status |
| DELETE | `/api/admin/bestillinger/:id` | Slett bestilling |

Admin-API-et krever headeren `x-admin-password` med riktig passord.
