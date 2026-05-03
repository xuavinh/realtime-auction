include .env
export

MIGRATE = migrate -path $(MIGRATION_DIR) -database "$(CONNECTION_STRING)"
MIGRATION_DIR = internal/db/migrations
CONNECTION_STRING = $(DB_DSN)
importdb:
	docker exec -i postgres-db psql -U $(DB_USER) -d $(DB_NAME) < ./backupdb-master-golang.sql
exportdb:
	docker exec -i postgres-db pg_dump -U $(DB_USER) -d $(DB_NAME) > ./backupdb-master-golang.sql

migrate-create:
	migrate create -ext sql -dir $(MIGRATION_DIR) -seq $(NAME)
migrate-up:
	$(MIGRATE) up
migrate-down:
	$(MIGRATE) down
migrate-force:
	$(MIGRATE) force $(version)
.PHONY: importdb exportdb migrate-create migrate-up migrate-down