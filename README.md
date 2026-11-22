# Tunisie-Holidays.com — Frontend

Application Angular 18 du comparateur de voyages Tunisie-Holidays.com (vols, hôtels, voitures, locations de vacances, loisirs, espace partenaire et administration).

L'API Spring Boot est dans le dépôt [tunisie-holiday-api](https://github.com/Hichem-Nasri/tunisie-holiday-api), qui contient aussi le `docker-compose.yml` et la documentation complète.

## Développement

```bash
npm install
npm start
```

Le site est servi sur http://localhost:4200 ; les appels `/api` sont redirigés vers http://localhost:8080 (`proxy.conf.json`).

## Production

```bash
npm run build
```

Le `Dockerfile` construit l'application et la sert avec nginx, qui relaie `/api` vers le service `backend`.
