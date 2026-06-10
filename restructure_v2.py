#!/usr/bin/env python3
import psycopg2
from psycopg2.extras import execute_batch
import json
import re

DB_CONFIG = {
    'host': '127.0.0.1',
    'database': 'recipes_db',
    'user': 'postgres',
    'password': 'admin123',
    'port': 5432
}

UNITS = [
    'cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 'tbs',
    'teaspoon', 'teaspoons', 'tsp', 'pound', 'pounds', 'lb', 'lbs',
    'ounce', 'ounces', 'oz', 'fluid ounce', 'fluid ounces', 'fl oz',
    'gram', 'grams', 'g', 'kg', 'kilogram', 'kilograms',
    'ml', 'milliliter', 'milliliters', 'liter', 'liters', 'l',
    'pinch', 'pinches', 'dash', 'dashes',
    'clove', 'cloves', 'slice', 'slices',
    'can', 'cans', 'package', 'packages', 'pkg',
    'bunch', 'bunches', 'head', 'heads',
    'sprig', 'sprigs', 'stalk', 'stalks',
    'leaf', 'leaves', 'sheet', 'sheets',
    'piece', 'pieces', 'strip', 'strips',
    'quart', 'quarts', 'qt', 'pint', 'pints', 'pt',
    'gallon', 'gallons', 'gal',
    'drop', 'drops', 'handful', 'handfuls',
    'stick', 'sticks', 'bar', 'bars',
    'envelope', 'envelopes', 'bottle', 'bottles',
    'jar', 'jars', 'bag', 'bags', 'box', 'boxes',
    'container', 'containers', 'carton', 'cartons',
]

UNICODE_FRACTIONS = {
    '½': '1/2', '¼': '1/4', '¾': '3/4',
    '⅓': '1/3', '⅔': '2/3', '⅛': '1/8',
    '⅜': '3/8', '⅝': '5/8', '⅞': '7/8',
}

def normalize_quantity(text):
    if not text:
        return None
    text = text.strip()
    for unicode_frac, ascii_frac in UNICODE_FRACTIONS.items():
        text = text.replace(unicode_frac, ' ' + ascii_frac)
    text = text.strip()
    match = re.match(r'^(\d+)\s+(\d+)/(\d+)$', text)
    if match:
        return str(round(int(match.group(1)) + int(match.group(2))/int(match.group(3)), 4))
    match = re.match(r'^(\d+)/(\d+)$', text)
    if match:
        return str(round(int(match.group(1))/int(match.group(2)), 4))
    match = re.match(r'^[\d\.]+$', text)
    if match:
        return text
    return text

def parse_ingredient(raw):
    original = raw.strip()
    text = original
    for unicode_frac, ascii_frac in UNICODE_FRACTIONS.items():
        text = text.replace(unicode_frac, ascii_frac + ' ')
    text = re.sub(r'\s+', ' ', text).strip()

    qty_pattern   = r'^((?:\d+\s+)?\d+/\d+|\d+\.?\d*)\s*'
    sorted_units  = sorted(UNITS, key=len, reverse=True)
    unit_pattern  = '(' + '|'.join(re.escape(u) for u in sorted_units) + r')\s*'

    # quantité + unité + produit
    match = re.match(qty_pattern + unit_pattern + r'(.+)$', text, re.IGNORECASE)
    if match:
        return (
            normalize_quantity(match.group(1)),
            match.group(2).lower(),
            match.group(3).strip()
        )

    # quantité + produit (unité éventuelle en fin)
    match = re.match(qty_pattern + r'(.+)$', text, re.IGNORECASE)
    if match:
        quantity = normalize_quantity(match.group(1))
        rest     = match.group(2).strip()
        words    = rest.split()
        if words and words[-1].lower() in UNITS:
            return quantity, words[-1].lower(), ' '.join(words[:-1]).strip()
        return quantity, None, rest

    # unité + produit (sans quantité)
    match = re.match(r'^' + unit_pattern + r'(.+)$', text, re.IGNORECASE)
    if match:
        return None, match.group(1).lower(), match.group(2).strip()

    return None, None, original

# ─────────────────────────────────────────────
# ÉTAPE 1 : Créer les tables
# ─────────────────────────────────────────────
def create_tables(conn):
    with conn.cursor() as cur:
        cur.execute("""
        DROP TABLE IF EXISTS directions        CASCADE;
        DROP TABLE IF EXISTS ingredients       CASCADE;
        DROP TABLE IF EXISTS products          CASCADE;
        DROP TABLE IF EXISTS recipes_new       CASCADE;
        DROP TABLE IF EXISTS subcategories     CASCADE;
        DROP TABLE IF EXISTS categories        CASCADE;

        CREATE TABLE categories (
            id       SERIAL PRIMARY KEY,
            name_en  VARCHAR(200) UNIQUE,
            name_fr  VARCHAR(200)
        );

        CREATE TABLE subcategories (
            id           SERIAL PRIMARY KEY,
            name_en      VARCHAR(200) UNIQUE,
            name_fr      VARCHAR(200),
            category_id  INTEGER REFERENCES categories(id)
        );

        CREATE TABLE recipes_new (
            id              SERIAL PRIMARY KEY,
            recipe_title    VARCHAR(500),
            description     TEXT,
            category_id     INTEGER REFERENCES categories(id),
            subcategory_id  INTEGER REFERENCES subcategories(id),
            num_ingredients INTEGER,
            num_steps       INTEGER,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE products (
            id    SERIAL PRIMARY KEY,
            name  VARCHAR(500) UNIQUE NOT NULL
        );

        CREATE TABLE ingredients (
            id          SERIAL PRIMARY KEY,
            recipe_id   INTEGER REFERENCES recipes_new(id) ON DELETE CASCADE,
            product_id  INTEGER REFERENCES products(id),
            quantity    VARCHAR(50),
            unit        VARCHAR(50),
            raw_text    TEXT,
            position    INTEGER
        );

        CREATE TABLE directions (
            id          SERIAL PRIMARY KEY,
            recipe_id   INTEGER REFERENCES recipes_new(id) ON DELETE CASCADE,
            step_number INTEGER,
            instruction TEXT
        );

        CREATE INDEX idx_ingredients_recipe  ON ingredients(recipe_id);
        CREATE INDEX idx_ingredients_product ON ingredients(product_id);
        CREATE INDEX idx_directions_recipe   ON directions(recipe_id);
        CREATE INDEX idx_recipes_category    ON recipes_new(category_id);
        CREATE INDEX idx_products_name       ON products(name);
        """)
    conn.commit()
    print("✅ Tables créées\n")

# ─────────────────────────────────────────────
# ÉTAPE 2 : Migrer les données
# ─────────────────────────────────────────────
def migrate_data(conn):

    # Catégories
    print("📋 Migration des catégories...")
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO categories (name_en, name_fr)
            SELECT DISTINCT category_en, category_fr FROM recipes
            WHERE category_en IS NOT NULL
            ON CONFLICT (name_en) DO NOTHING;
        """)
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM categories;")
        print(f"   ✅ {cur.fetchone()[0]} catégories\n")

    # Sous-catégories
    print("📋 Migration des sous-catégories...")
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO subcategories (name_en, name_fr, category_id)
            SELECT DISTINCT r.subcategory_en, r.subcategory_fr, c.id
            FROM recipes r
            JOIN categories c ON c.name_en = r.category_en
            WHERE r.subcategory_en IS NOT NULL
            ON CONFLICT (name_en) DO NOTHING;
        """)
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM subcategories;")
        print(f"   ✅ {cur.fetchone()[0]} sous-catégories\n")

    # Recettes
    print("🍽️  Migration des recettes...")
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO recipes_new (
                recipe_title, description,
                category_id, subcategory_id,
                num_ingredients, num_steps
            )
            SELECT r.recipe_title, r.description,
                   c.id, s.id,
                   r.num_ingredients, r.num_steps
            FROM recipes r
            LEFT JOIN categories c ON c.name_en = r.category_en
            LEFT JOIN subcategories s ON s.name_en = r.subcategory_en;
        """)
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM recipes_new;")
        print(f"   ✅ {cur.fetchone()[0]} recettes\n")

    # Produits + Ingrédients
    print("🥕  Parsing et migration des produits/ingrédients...")
    with conn.cursor() as cur:
        cur.execute("""
            SELECT r_old.id, r_new.id, r_old.ingredients
            FROM recipes r_old
            JOIN recipes_new r_new ON r_new.recipe_title = r_old.recipe_title;
        """)
        rows = cur.fetchall()

    products_set    = {}
    ingredients_data = []

    for _, new_id, ingredients_json in rows:
        if not ingredients_json:
            continue
        items = json.loads(ingredients_json) if isinstance(ingredients_json, str) else ingredients_json
        for pos, raw in enumerate(items, 1):
            raw = raw.strip()
            if not raw:
                continue
            quantity, unit, product_name = parse_ingredient(raw)
            product_name = product_name.lower().strip()
            products_set[product_name] = True
            ingredients_data.append((new_id, product_name, quantity, unit, raw, pos))

    # Insérer les produits uniques
    with conn.cursor() as cur:
        execute_batch(cur, """
            INSERT INTO products (name) VALUES (%s)
            ON CONFLICT (name) DO NOTHING;
        """, [(p,) for p in products_set.keys()])
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM products;")
        print(f"   ✅ {cur.fetchone()[0]} produits uniques\n")

    # Insérer les ingrédients
    print("🔗  Création des liaisons ingrédients-produits...")
    with conn.cursor() as cur:
        execute_batch(cur, """
            INSERT INTO ingredients (recipe_id, product_id, quantity, unit, raw_text, position)
            SELECT %s, p.id, %s, %s, %s, %s
            FROM products p WHERE p.name = %s;
        """, [(r, q, u, raw, pos, prod) for r, prod, q, u, raw, pos in ingredients_data])
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM ingredients;")
        print(f"   ✅ {cur.fetchone()[0]} ingrédients créés\n")

    # Directions
    print("📝  Migration des étapes...")
    with conn.cursor() as cur:
        cur.execute("""
            SELECT r_old.id, r_new.id, r_old.directions
            FROM recipes r_old
            JOIN recipes_new r_new ON r_new.recipe_title = r_old.recipe_title;
        """)
        rows = cur.fetchall()

    directions_data = []
    for _, new_id, directions_json in rows:
        if not directions_json:
            continue
        steps = json.loads(directions_json) if isinstance(directions_json, str) else directions_json
        for step_num, instruction in enumerate(steps, 1):
            if instruction.strip():
                directions_data.append((new_id, step_num, instruction.strip()))

    with conn.cursor() as cur:
        execute_batch(cur, """
            INSERT INTO directions (recipe_id, step_number, instruction)
            VALUES (%s, %s, %s);
        """, directions_data)
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM directions;")
        print(f"   ✅ {cur.fetchone()[0]} étapes créées\n")

# ─────────────────────────────────────────────
# ÉTAPE 3 : Vérification
# ─────────────────────────────────────────────
def verify(conn):
    with conn.cursor() as cur:
        tables = ['categories', 'subcategories', 'recipes_new', 'products', 'ingredients', 'directions']
        print("📊 RÉSUMÉ FINAL:")
        for table in tables:
            cur.execute(f"SELECT COUNT(*) FROM {table};")
            print(f"   {table:<20} {cur.fetchone()[0]:>8} lignes")

        print("\n📌 Exemple recette avec ingrédients parsés:")
        cur.execute("""
            SELECT r.recipe_title,
                   p.name       AS produit,
                   i.quantity   AS quantite,
                   i.unit       AS unite,
                   i.raw_text   AS texte_original
            FROM recipes_new r
            JOIN ingredients i ON i.recipe_id = r.id
            JOIN products p    ON p.id = i.product_id
            WHERE r.id = 1
            ORDER BY i.position;
        """)
        rows = cur.fetchall()
        if rows:
            print(f"\n   Recette : {rows[0][0]}\n")
            print(f"   {'Produit':<30} {'Qté':<8} {'Unité':<15} Texte original")
            print(f"   {'-'*75}")
            for row in rows:
                print(f"   {row[1]:<30} {str(row[2] or ''):<8} {str(row[3] or ''):<15} {row[4]}")

if __name__ == "__main__":
    conn = psycopg2.connect(**DB_CONFIG)
    print("=" * 60)
    print("🔄  RESTRUCTURATION BASE DE DONNÉES RECETTES")
    print("=" * 60 + "\n")
    create_tables(conn)
    migrate_data(conn)
    verify(conn)
    conn.close()
    print("\n✅ Restructuration terminée !")
