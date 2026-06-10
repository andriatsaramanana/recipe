#!/usr/bin/env python3
import re
import unicodedata

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

# Fractions unicode → float/string
UNICODE_FRACTIONS = {
    '½': '1/2', '¼': '1/4', '¾': '3/4',
    '⅓': '1/3', '⅔': '2/3', '⅛': '1/8',
    '⅜': '3/8', '⅝': '5/8', '⅞': '7/8',
}

def normalize_quantity(text):
    """Convertir les fractions unicode et textuelles en valeur numérique"""
    if not text:
        return None
    text = text.strip()

    # Remplacer les fractions unicode
    for unicode_frac, ascii_frac in UNICODE_FRACTIONS.items():
        text = text.replace(unicode_frac, ' ' + ascii_frac)

    text = text.strip()

    # Gérer "1 1/2" → "1.5", "3/4" → "0.75", etc.
    # Nombre entier + fraction : "1 1/2"
    match = re.match(r'^(\d+)\s+(\d+)/(\d+)$', text)
    if match:
        whole = int(match.group(1))
        num   = int(match.group(2))
        den   = int(match.group(3))
        result = whole + num/den
        return str(round(result, 4))

    # Fraction seule : "3/4"
    match = re.match(r'^(\d+)/(\d+)$', text)
    if match:
        num = int(match.group(1))
        den = int(match.group(2))
        return str(round(num/den, 4))

    # Nombre simple : "2", "0.5"
    match = re.match(r'^[\d\.]+$', text)
    if match:
        return text

    return text

def parse_ingredient(raw):
    """
    Parser un ingrédient en (quantity, unit, product_name, clean_text)
    Exemples:
      "4 fresh mint leaves"      → ('4',    'leaves',       'fresh mint',      'fresh mint leaves')
      "½ fluid ounce simple syrup" → ('0.5', 'fluid ounce', 'simple syrup',    'simple syrup')
      "¾ cup butter"             → ('0.75', 'cup',          'butter',          'butter')
      "2 baking potatoes"        → ('2',    None,           'baking potatoes', 'baking potatoes')
      "salt and pepper"          → (None,   None,           'salt and pepper', 'salt and pepper')
    """
    original = raw.strip()

    # Remplacer fractions unicode
    text = original
    for unicode_frac, ascii_frac in UNICODE_FRACTIONS.items():
        text = text.replace(unicode_frac, ascii_frac + ' ')
    text = re.sub(r'\s+', ' ', text).strip()

    quantity = None
    unit     = None
    product  = None

    # Pattern quantité: entier, décimal, fraction, ou combinaison
    qty_pattern = r'^((?:\d+\s+)?\d+/\d+|\d+\.?\d*)\s*'

    # Trier les unités par longueur décroissante (pour matcher "fluid ounce" avant "ounce")
    sorted_units = sorted(UNITS, key=len, reverse=True)
    unit_pattern = '(' + '|'.join(re.escape(u) for u in sorted_units) + r')\s*'

    # Essai 1: quantité + unité + produit
    match = re.match(qty_pattern + unit_pattern + r'(.+)$', text, re.IGNORECASE)
    if match:
        quantity = normalize_quantity(match.group(1))
        unit     = match.group(2).lower()
        product  = match.group(3).strip()
        # Nettoyer adjectifs en début de produit (ex: "fresh", "dried", "ground")
        clean_text = f"{product} {unit}" if unit in ['leaves', 'slices', 'pieces', 'strips', 'sprigs', 'stalks', 'cloves', 'heads', 'drops'] else product
        return quantity, unit, product, product

    # Essai 2: quantité + produit (pas d'unité)
    match = re.match(qty_pattern + r'(.+)$', text, re.IGNORECASE)
    if match:
        quantity = normalize_quantity(match.group(1))
        rest     = match.group(2).strip()

        # Vérifier si le dernier mot est une unité (ex: "4 fresh mint leaves")
        words = rest.split()
        if words and words[-1].lower() in UNITS:
            unit    = words[-1].lower()
            product = ' '.join(words[:-1]).strip()
        else:
            product = rest

        return quantity, unit, product, product

    # Essai 3: unité + produit (sans quantité)
    match = re.match(r'^' + unit_pattern + r'(.+)$', text, re.IGNORECASE)
    if match:
        unit    = match.group(1).lower()
        product = match.group(2).strip()
        return None, unit, product, product

    # Aucun pattern: texte brut
    return None, None, original, original


# ─── TEST ───
if __name__ == "__main__":
    tests = [
        "4 fresh mint leaves",
        "½ fluid ounce simple syrup",
        "¾ cup butter",
        "3/4 cup ketchup",
        "1/2 cup beer",
        "1 tablespoon Worcestershire sauce",
        "1/2 teaspoon onion powder",
        "1/4 teaspoon cayenne",
        "2 baking potatoes",
        "olive oil cooking spray",
        "1/2 teaspoon garlic powder",
        "salt and freshly ground black pepper",
        "1 1/2 cups sugar",
        "2 cloves garlic",
        "3 stalks celery",
        "1 can tomato sauce",
    ]

    print(f"\n{'Texte original':<40} {'Qté':<8} {'Unité':<15} {'Produit'}")
    print("-" * 85)
    for t in tests:
        q, u, p, clean = parse_ingredient(t)
        print(f"{t:<40} {str(q or ''):<8} {str(u or ''):<15} {p}")
