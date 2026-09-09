## Avvio rapido DigitalTwin

Prerequisiti già installati: Docker Desktop attivo, `.env` presente.

### Primo setup (solo la prima volta)
1. Installa le dipendenze PHP (host): `composer install`
2. Avvia i container: `docker compose up -d`
3. Installa dipendenze front-end dentro il container:  
   `docker compose exec -T laravel.test npm ci`
4. Esegui setup Laravel (una tantum):  
   `docker compose exec -T laravel.test php artisan migrate --force`  
   `docker compose exec -T laravel.test php artisan storage:link`

### Avvio quotidiano
1. Avvia i container: `docker compose up -d`
2. Avvia Vite dev server (serve per il front-end hot-reload):  
   `docker compose exec -d laravel.test npm run dev -- --host`
3. Attendi salute dei servizi: `docker compose ps`
4. Apri:
   - App: http://localhost
   - Vite dev server: http://localhost:5173 (caricato via proxy)
   - Mailpit: http://localhost:8025

### Credenziali di prova
- Email: `demo@digital.twin`
- Password: `password`

### Spegnere
- Ferma e rimuovi i container/volumi: `docker compose down -v`
- Solo stop (mantiene dati): `docker compose stop`
