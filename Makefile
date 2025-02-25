# Define o serviço do Docker onde os comandos serão executados
DOCKER_SERVICE=payload
PNPM=docker-compose exec $(DOCKER_SERVICE) pnpm

# Alvos principais baseados nos scripts do package.json
build:
	$(PNPM) run build

dev:
	$(PNPM) run dev

devsafe:
	$(PNPM) run devsafe

generate-importmap:
	$(PNPM) run generate:importmap

generate-types:
	$(PNPM) run generate:types

lint:
	$(PNPM) run lint

payload:
	$(PNPM) run payload

start:
	$(PNPM) run start

# Alvos auxiliares para gerenciamento do Docker
up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart $(DOCKER_SERVICE)

logs:
	docker-compose logs -f $(DOCKER_SERVICE)

# Instalar dependências dentro do container
install:
	$(PNPM) install

# Rodar migrações do Payload CMS
migrate:
	$(PNPM) payload migrate
