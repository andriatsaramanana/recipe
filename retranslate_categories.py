#!/usr/bin/env python3
import psycopg2
from deep_translator import GoogleTranslator
import time

DB_CONFIG = {
    'host': '127.0.0.1',
    'database': 'recipes_db',
    'user': 'postgres',
    'password': 'admin123',
    'port': 5432
}

conn = psycopg2.connect(**DB_CONFIG)
translator = GoogleTranslator(source_language='en', target_language='fr')

with conn.cursor() as cur:
    cur.execute("SELECT DISTINCT category_en FROM recipes WHERE category_en IS NOT NULL;")
    categories = [row[0] for row in cur.fetchall()]
    cur.execute("SELECT DISTINCT subcategory_en FROM recipes WHERE subcategory_en IS NOT NULL;")
    subcategories = [row[0] for row in cur.fetchall()]

all_values = list(set(categories + subcategories))
print(f"📋 {len(all_values)} valeurs à traduire\n")

translations = {}
for i, val in enumerate(all_values, 1):
    try:
        translations[val] = translator.translate(val)
        print(f"   {i}/{len(all_values)}  {val}  →  {translations[val]}")
        time.sleep(0.3)
    except Exception as e:
        print(f"   ⚠️ Erreur '{val}': {e}")
        translations[val] = val

print("\n🔄 Mise à jour de la base...")
with conn.cursor() as cur:
    for en, fr in translations.items():
        cur.execute("UPDATE recipes SET category_fr = %s WHERE category_en = %s;", (fr, en))
        cur.execute("UPDATE recipes SET subcategory_fr = %s WHERE subcategory_en = %s;", (fr, en))

conn.commit()
conn.close()
print("✅ Catégories traduites et mises à jour !")
