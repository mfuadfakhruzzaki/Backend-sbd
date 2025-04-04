.PHONY: build run dev stop clean logs help

CONTAINER_NAME=ecommerce-backend
DB_CONTAINER=ecommerce-db

help:
	@echo "Available commands:"
	@echo "  make build       - Build Docker images"
	@echo "  make run         - Run in production mode"
	@echo "  make dev         - Run in development mode"
	@echo "  make stop        - Stop all containers"
	@echo "  make clean       - Remove containers and volumes"
	@echo "  make logs        - View backend logs"
	@echo "  make db-logs     - View database logs"
	@echo "  make test        - Run tests"

build:
	docker-compose build --no-cache

run:
	docker-compose up -d

dev:
	NODE_ENV=development docker-compose up

stop:
	docker-compose down

clean:
	docker-compose down -v
	
logs:
	docker-compose logs -f $(CONTAINER_NAME)

db-logs:
	docker-compose logs -f $(DB_CONTAINER)

test:
	npm test

db-backup:
	@mkdir -p backups
	@docker exec $(DB_CONTAINER) sh -c 'mysqldump -u root -p"$$MYSQL_ROOT_PASSWORD" --databases $$MYSQL_DATABASE' > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup created in backups/ directory"

db-restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make db-restore FILE=backups/your-backup-file.sql"; \
		exit 1; \
	fi; \
	cat $(FILE) | docker exec -i $(DB_CONTAINER) sh -c 'mysql -u root -p"$$MYSQL_ROOT_PASSWORD"'
	@echo "Restore completed from $(FILE)" 