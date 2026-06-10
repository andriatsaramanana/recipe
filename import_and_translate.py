#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
import time

try:
    import psycopg2
    from psycopg2.extras import execute_batch
except ImportError:
    print("❌ pip3 install --user psycopg2-binary")
    sys.exit(1)

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("❌ pip3 install --user deep-translator")
    sys.exit(1)

DB_CONFIG = {
    'host': 'localhost',
    'database': 'recipes_db',
    'user': 'postgres',
    'password': 'Sahala2007',
    'port': 5432
}

JSON_FILE = "/home/andriatsararamanana/Documents/Projet/recipe/data/2_Recipe_json.json"
BATCH_SIZE = 500

def create_table(conn):
    with conn.cursor() as cur:
        cur.execute("""
        DROP TABLE IF EXISTS recipes CASCADE;
        CREATE TABLE recipes (
            id               SERIAL PRIMARY KEY,
            recipe_title     VARCHAR(500),
            category_en      VARCHAR(200),
            category_fr      VARCHAR(200),
            subcategory_en   VARCHAR(200),
            subcategory_fr   VARCHAR(200),
            description      TEXT,
            ingredients      JSON,
            directions       JSON,
            num_ingredients  INTEGER,
            num_steps        INTEGER,
            created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_category_fr ON recipes(category_fr);
        CREATE INDEX idx_category_en ON recipes(category_en);
        """)
    conn.commit()
    print("✅ Table créée\n")

def translate_categories(json_file):
    print("📋 Collecte des catégories uniques...")
    categories = set()
    subcategories = set()
    with open(json_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
                if r.get('category'): categories.add(r['category'])
                if r.get('subcategory'): subcategories.add(r['subcategory'])
            except:
                continue
    all_values = categories | subcategories
    print(f"   {len(all_values)} valeurs uniques à traduire\n")
    translator = GoogleTranslator(source_language='en', target_language='fr')
    translations = {}
    print("🔄 Traduction des catégories...")
    for i, val in enumerate(sorted(all_values), 1):
        try:
            translations[val] = translator.translate(val)
            time.sleep(0.15)
            if i % 20 == 0:
                print(f"   {i}/{len(all_values)} traduits...")
        except Exception as e:
            translations[val] = val
    print(f"✅ {len(translations)} catégories traduites\n")
    return translations

def import_recipes(conn, json_file, translations):
    print("🚀 Import en cours...\n")
    insert_sql = """
    INSERT INTO recipes (
        recipe_title, category_en, category_fr,
        subcategory_en, subcategory_fr,
        description, ingredients, directions,
        num_ingredients, num_steps
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    batch = []
    total = 0
    with open(json_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
                cat_en = r.get('category', '')
                sub_en = r.get('subcategory', '')
                batch.append((
                    r.get('recipe_title', ''),
                    cat_en, translations.get(cat_en, cat_en),
                    sub_en, translations.get(sub_en, sub_en),
                    r.get('description', ''),
                    json.dumps(r.get('ingredients', []), ensure_ascii=False),
                    json.dumps(r.get('directions', []), ensure_ascii=False),
                    r.get('num_ingredients', 0),
                    r.get('num_steps', 0)
                ))
                if len(batch) >= BATCH_SIZE:
                    with conn.cursor() as cur:
                        execute_batch(cur, insert_sql, batch)
                    conn.commit()
                    total += len(batch)
                    batch = []
                    print(f"   ✅ {total} recettes importées...")
            except:
                continue
    if batch:
        with conn.cursor() as cur:
            execute_batch(cur, insert_sql, batch)
        conn.commit()
        total += len(batch)
    print(f"\n🎉 {total} recettes importées !")

def verify(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM recipes;")
        count = cur.fetchone()[0]
        cur.execute("""
            SELECT category_en, category_fr, COUNT(*) as nb
            FROM recipes GROUP BY category_en, category_fr
            ORDER BY nb DESC LIMIT 5;
        """)
        top = cur.fetchall()
    print(f"\n📊 Total : {count} recettes")
    print(f"\nTop 5 catégories :")
    for row in top:
        print(f"   {row[2]:5d}  {row[0]}  →  {row[1]}")

if __name__ == "__main__":
    print("=" * 60)
    print("🍽️  IMPORT RECETTES → POSTGRESQL")
    print("=" * 60 + "\n")
    try:
        print("🔌 Connexion à PostgreSQL...")
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Connecté\n")
    except psycopg2.OperationalError as e:
        print(f"❌ Connexion échouée: {e}")
        sys.exit(1)
    create_table(conn)
    translations = translate_categories(JSON_FILE)
    import_recipes(conn, json_file=JSON_FILE, translations=translations)
    verify(conn)
    conn.close()
    print("\n✅ Terminé !")
