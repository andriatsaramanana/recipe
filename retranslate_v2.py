#!/usr/bin/env python3
import psycopg2
import requests
import time

DB_CONFIG = {
    'host': '127.0.0.1',
    'database': 'recipes_db',
    'user': 'postgres',
    'password': 'admin123',
    'port': 5432
}

def translate_mymemory(text):
    try:
        url = "https://api.mymemory.translated.net/get"
        params = {'q': text, 'langpair': 'en|fr'}
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        if data['responseStatus'] == 200:
            return data['responseData']['translatedText']
        return text
    except:
        return text

conn = psycopg2.connect(**DB_CONFIG)

with conn.cursor() as cur:
    cur.execute("""
        SELECT DISTINCT category_en FROM recipes 
        WHERE category_en IS NOT NULL;
    """)
    categories = [row[0] for row in cur.fetchall()]
    cur.execute("""
        SELECT DISTINCT subcategory_en FROM recipes 
        WHERE subcategory_en IS NOT NULL;
    """)
    subcategories = [row[0] for row in cur.fetchall()]

all_values = list(set(categories + subcategories))
print(f"📋 {len(all_values)} valeurs à traduire\n")

translations = {}
for i, val in enumerate(all_values, 1):
    translated = translate_mymemory(val)
    translations[val] = translated
    print(f"   {i}/{len(all_values)}  {val}  →  {translated}")
    time.sleep(0.5)

print("\n🔄 Mise à jour de la base...")
with conn.cursor() as cur:
    for en, fr in translations.items():
        cur.execute("UPDATE recipes SET category_fr = %s WHERE category_en = %s;", (fr, en))
        cur.execute("UPDATE recipes SET subcategory_fr = %s WHERE subcategory_en = %s;", (fr, en))

conn.commit()
conn.close()
print("✅ Traduction terminée !")
