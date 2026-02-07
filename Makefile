# Red Tetris - Docker Makefile
# Simplifies common Docker commands

.PHONY: help build up down logs restart clean dev dev-build dev-down

# Default target
help:
	@echo "Red Tetris - Docker Commands"
	@echo ""
	@echo "Production:"
	@echo "  make build          - Build production images"
	@echo "  make up             - Start production containers"
	@echo "  make down           - Stop production containers"
	@echo "  make restart        - Restart production containers"
	@echo "  make logs           - View production logs"
	@echo "  make clean          - Remove all containers, images, and volumes"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start development environment"
	@echo "  make dev-build      - Build and start development environment"
	@echo "  make dev-down       - Stop development environment"
	@echo "  make dev-logs       - View development logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make shell-server   - Open shell in server container"
	@echo "  make shell-client   - Open shell in client container"
	@echo "  make ps             - Show container status"

# Production Commands
build:
	@echo "🔨 Building production images..."
	docker-compose build

up:
	@echo "🚀 Starting production containers..."
	docker-compose up -d
	@echo "✅ Application running at http://localhost"

down:
	@echo "🛑 Stopping production containers..."
	docker-compose down

restart: down up
	@echo "🔄 Containers restarted"

logs:
	@echo "📋 Viewing production logs (Ctrl+C to exit)..."
	docker-compose logs -f

# Development Commands
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up
	@echo "✅ Development server running at http://localhost:5173"

dev-build:
	@echo "🔨 Building and starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-down:
	@echo "🛑 Stopping development containers..."
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	@echo "📋 Viewing development logs (Ctrl+C to exit)..."
	docker-compose -f docker-compose.dev.yml logs -f

# Utility Commands
shell-server:
	@echo "🐚 Opening shell in server container..."
	docker-compose exec server sh

shell-client:
	@echo "🐚 Opening shell in client container..."
	docker-compose exec client sh

ps:
	@echo "📊 Container Status:"
	docker-compose ps

clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f
	@echo "✅ Cleanup complete"

# Install Docker (Ubuntu/Debian)
install-docker:
	@echo "📦 Installing Docker and Docker Compose..."
	curl -fsSL https://get.docker.com -o get-docker.sh
	sudo sh get-docker.sh
	sudo usermod -aG docker $$USER
	@echo "✅ Docker installed. Please log out and back in for group changes to take effect."
	rm get-docker.sh
