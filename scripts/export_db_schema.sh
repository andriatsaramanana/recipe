#!/bin/bash
# Exporte la structure (DDL) complète de la base recipes_db dans db_schema_full.sql
set -euo pipefail

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-recipes_db}"
DB_PASSWORD="${DB_PASSWORD:-admin123}"
OUT="${1:-db_schema_full.sql}"

PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
  --schema-only --no-owner --no-privileges -f "$OUT"

echo "Schéma exporté dans $OUT"
