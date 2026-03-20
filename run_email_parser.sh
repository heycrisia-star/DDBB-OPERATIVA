#!/bin/bash
# run_email_parser.sh
# Ejecutado por launchd cada día a las 08:00h.
# Lee los emails de GYG/FH, actualiza mockTours.js y hace push a GitHub.

set -e

PROJECT_DIR="$(dirname "$0")"
LOG_FILE="$PROJECT_DIR/.tmp/parser.log"

mkdir -p "$PROJECT_DIR/.tmp"

echo "================================================" >> "$LOG_FILE"
echo "$(date '+%Y-%m-%d %H:%M:%S') — Iniciando parser" >> "$LOG_FILE"

# 1. Ejecutar el parser de emails
cd "$PROJECT_DIR"
/usr/bin/python3 "$PROJECT_DIR/execution/email_parser.py" >> "$LOG_FILE" 2>&1

# 2. Commit y push a GitHub
cd "$PROJECT_DIR"
git add src/data/mockTours.js >> "$LOG_FILE" 2>&1
git commit -m "auto: email parser $(date '+%Y-%m-%d %H:%M')" >> "$LOG_FILE" 2>&1 || echo "Nada nuevo que commitear" >> "$LOG_FILE"
git push origin main >> "$LOG_FILE" 2>&1

echo "$(date '+%Y-%m-%d %H:%M:%S') — Parser completado ✅" >> "$LOG_FILE"
