# Backend of AFK

## Description
Express typescript backend.
Routes for Indexer.
Telegram bot answers for AFK Mini app.

## TODO

- [] Data indexers of Launchpad
- [] Stats of launchpad: merged events of different models of the indexer to get the last state of Launch etc
- [] Telegram Alert for Event on AFK
- [] Gamification

## Kill process issues
```
sudo lsof -t -i:5050

sudo kill -9 [ID_RECEIVED_BEFORE]
```

## Run Backend Postgres database

```
docker run --name afk-data-backend -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=data-backend -d -p 5433:5432 postgres
```