#!/bin/bash
# Exporte toutes les données de recipes_db sous forme d'INSERT, une fichier par table,
# dans l'ordre des dépendances (clés étrangères), pour réimport sur une base vide
# (après application de db_schema_full.sql).
set -euo pipefail

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-recipes_db}"
DB_PASSWORD="${DB_PASSWORD:-admin123}"
OUT_DIR="${1:-db_export}"

mkdir -p "$OUT_DIR"

TABLES=(
  categories
  subcategories
  products
  countries
  regions
  seasons
  recipes
  recipes_new
  ingredients
  directions
  recipe_seasons
  recipe_specialties
  product_varieties
  product_prices
  product_seasons
)

i=1
for t in "${TABLES[@]}"; do
  file=$(printf "%s/%02d_%s.sql" "$OUT_DIR" "$i" "$t")
  echo "Export $t -> $file"
  PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
    --data-only --inserts --rows-per-insert=100 --no-owner --no-privileges \
    -t "$t" -f "$file"
  i=$((i + 1))
done

echo "Export terminé dans $OUT_DIR/"
