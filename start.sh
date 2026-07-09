#!/usr/bin/env sh
set -eu

PROJECT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$PROJECT_ROOT"

COMPOSE_FILE="docker-composefull.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  COMPOSE_FILE="docker-compose.yml"
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Nessun file docker-compose trovato nella cartella del progetto." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker non risponde. Avvia Docker e riprova." >&2
  exit 1
fi

dotenv_value() {
  name="$1"
  [ -f .env ] || return 0
  grep -E "^[[:space:]]*$name=" .env | head -n 1 | sed -E "s/^[[:space:]]*$name=//; s/^['\"]//; s/['\"]$//"
}

APP_PORT="${APP_PORT:-$(dotenv_value APP_PORT)}"
APP_PORT="${APP_PORT:-8080}"
export APP_PORT

if [ -z "${WWWUSER:-}" ]; then
  WWWUSER="$(id -u 2>/dev/null || echo 1000)"
fi
if [ -z "${WWWGROUP:-}" ]; then
  WWWGROUP="$(id -g 2>/dev/null || echo 1000)"
fi
export WWWUSER WWWGROUP

mkdir -p "homeassistant/config" "Materiale_non_progetto/Home Assistant"

BUILD_ARG="--build"
LOGS=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --no-build) BUILD_ARG="" ;;
    --logs) LOGS=1 ;;
    *)
      echo "Opzione non riconosciuta: $1" >&2
      exit 1
      ;;
  esac
  shift
done

echo "Avvio Digital Twin con $COMPOSE_FILE..."
docker compose -f "$COMPOSE_FILE" up -d $BUILD_ARG

echo ""
echo "Progetto avviato:"
echo "  Frontend:        http://localhost:$APP_PORT"
echo "  API DigitalTwin: http://localhost:8000"
echo "  Home Assistant:  http://localhost:8123"
echo "  Mailpit:         http://localhost:8025"

if [ "$LOGS" -eq 1 ]; then
  docker compose -f "$COMPOSE_FILE" logs -f
fi
