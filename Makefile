.PHONY: *

COMPOSE := docker compose -f docker/compose.yaml -p f1-picks-nextjs
APP := $(COMPOSE) exec -T app

start: up db

up:
	$(COMPOSE) up -d --build --force-recreate

stop:
	$(COMPOSE) down -v --remove-orphans

restart: stop start

db:
	$(APP) npm run db:refresh

shell:
	$(COMPOSE) exec app sh

open:
	open http://localhost:3000/
