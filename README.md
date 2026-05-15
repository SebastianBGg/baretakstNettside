# Bare Takst AS – Fullstack Booking-løsning

Dette er en skreddersydd webapplikasjon utviklet for Bare Takst AS. Prosjektet er bygget som en fullstack-løsning for å håndtere kundehenvendelser og administrasjon av bestillinger gjennom et dedikert kontrollpanel.

## 🚀 Teknologier

Prosjektet er bygget med fokus på ytelse og enkel skalering:

* **Frontend:** HTML5, CSS3 og JavaScript (Vanilla) for et responsivt og lettvektig brukergrensesnitt.
* **Backend:** Node.js med Express-rammeverket for håndtering av API-logikk.
* **Database:** PostgreSQL for sikker lagring av bestillingsdata og håndtering av relasjonelle data.
* **Hosting/Infrastruktur:** Deployet på Railway med kontinuerlig integrasjon (CI/CD) fra GitHub.

## 🛠 Funksjonalitet

Applikasjonen består av to hoveddeler:

### Kunde-grensesnitt
* **Dynamisk bookingskjema:** Validerer brukerinput før innsending for å sikre datakvalitet.
* **API-integrasjon:** Automatisert kommunikasjon mot backend for umiddelbar registrering av oppdrag.

### Admin-panel (Dashboard)
* **Autentisering:** Sikker tilgangsstyring via miljøvariabler og passordbeskyttelse for administrative oppgaver.
* **Ordrehåndtering:** Full CRUD-funksjonalitet (Create, Read, Update, Delete) for effektiv administrasjon av bestillinger.
* **Statuskontroll:** Mulighet for å oppdatere oppdragsstatus i sanntid via PATCH-endepunkter.

## 🏗 Systemarkitektur

Prosjektet følger en modulær struktur for å skille logikk og presentasjon:

* `/public`: Inneholder klientside-filer og statiske ressurser (HTML, CSS, bilder).
* `server.js`: Sentral backend-logikk som håndterer ruting, databasetilkobling og sikkerhetstiltak.
* **REST API:** Veldefinerte endepunkter for sikker kommunikasjon, inkludert bruk av tilpassede headere (`x-admin-password`) for beskyttede ressurser.

---

### API-oversikt

| Metode | Endepunkt | Beskrivelse |
|--------|-----------|-------------|
| POST | `/api/bestill` | Tar imot og lagrer ny bestilling fra kunde |
| GET | `/api/admin/bestillinger` | Henter alle bestillinger (krever autentisering) |
| PATCH | `/api/admin/bestillinger/:id` | Oppdaterer status på en spesifikk ordre |
| DELETE | `/api/admin/bestillinger/:id` | Sletter en bestilling fra systemet |
