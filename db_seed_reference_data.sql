-- Seed : variétés + prix pour quelques produits courants,
-- et association de recettes existantes à des saisons / spécialités régionales.

-- ============ VARIÉTÉS ============

-- Laitue (lettuce)
INSERT INTO product_varieties (product_id, name, description, region_id, country_id, season_id) VALUES
((SELECT id FROM products WHERE name = 'lettuce'), 'Batavia', 'Salade croquante à feuilles ondulées', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été')),
((SELECT id FROM products WHERE name = 'lettuce'), 'Feuille de chêne', 'Feuilles découpées rouges ou vertes, tendres', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été')),
((SELECT id FROM products WHERE name = 'lettuce'), 'Romaine', 'Feuilles longues et croquantes', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été'));

-- Tomate (tomato)
INSERT INTO product_varieties (product_id, name, description, region_id, country_id, season_id) VALUES
((SELECT id FROM products WHERE name = 'tomato'), 'Cœur de Bœuf', 'Grosse tomate charnue, peu de pépins', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été')),
((SELECT id FROM products WHERE name = 'tomato'), 'Cerise', 'Petite tomate ronde et sucrée', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été')),
((SELECT id FROM products WHERE name = 'tomato'), 'Ananas', 'Grosse tomate jaune-orangé striée de rouge', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été'));

-- Concombre (cucumber)
INSERT INTO product_varieties (product_id, name, description, region_id, country_id, season_id) VALUES
((SELECT id FROM products WHERE name = 'cucumber'), 'Lisse', 'Concombre long à peau lisse', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été')),
((SELECT id FROM products WHERE name = 'cucumber'), 'Épineux', 'Concombre court à peau rugueuse', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été'));

-- Pomme de terre (potatoes)
INSERT INTO product_varieties (product_id, name, description, region_id, country_id, season_id) VALUES
((SELECT id FROM products WHERE name = 'potatoes'), 'Bintje', 'Polyvalente, idéale pour la friture', (SELECT id FROM regions WHERE name_fr='Hauts-de-France'), (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Automne')),
((SELECT id FROM products WHERE name = 'potatoes'), 'Charlotte', 'Chair ferme, idéale en salade ou vapeur', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été')),
((SELECT id FROM products WHERE name = 'potatoes'), 'Ratte', 'Petite pomme de terre fondante au goût de noisette', (SELECT id FROM regions WHERE name_fr='Nouvelle-Aquitaine'), (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Automne')),
((SELECT id FROM products WHERE name = 'potatoes'), 'Vitelotte', 'Pomme de terre ancienne à chair violette', (SELECT id FROM regions WHERE name_fr='Île-de-France'), (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Automne'));

-- Carotte (carrots)
INSERT INTO product_varieties (product_id, name, description, region_id, country_id, season_id) VALUES
((SELECT id FROM products WHERE name = 'carrots'), 'Nantaise', 'Carotte cylindrique sans cœur, douce', (SELECT id FROM regions WHERE name_fr='Pays de la Loire'), (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Été')),
((SELECT id FROM products WHERE name = 'carrots'), 'Fane', 'Carotte primeur récoltée jeune avec ses fanes', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Printemps'));

-- Pomme (apple)
INSERT INTO product_varieties (product_id, name, description, region_id, country_id, season_id) VALUES
((SELECT id FROM products WHERE name = 'apple'), 'Golden Delicious', 'Pomme jaune sucrée et juteuse', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Automne')),
((SELECT id FROM products WHERE name = 'apple'), 'Granny Smith', 'Pomme verte acidulée et croquante', NULL, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Automne')),
((SELECT id FROM products WHERE name = 'apple'), 'Reinette', 'Pomme ancienne à la chair ferme et parfumée', (SELECT id FROM regions WHERE name_fr='Normandie'), (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM seasons WHERE name_fr='Automne'));


-- ============ PRIX ============

-- Prix de base par produit (marché courant)
INSERT INTO product_prices (product_id, variety_id, price, unit, currency, market) VALUES
((SELECT id FROM products WHERE name = 'tomato'), NULL, 2.50, 'kg', 'EUR', 'Marché de Rungis'),
((SELECT id FROM products WHERE name = 'cucumber'), NULL, 1.80, 'kg', 'EUR', 'Marché de Rungis'),
((SELECT id FROM products WHERE name = 'lettuce'), NULL, 1.20, 'pièce', 'EUR', 'Marché de Rungis'),
((SELECT id FROM products WHERE name = 'potatoes'), NULL, 1.50, 'kg', 'EUR', 'Marché de Rungis'),
((SELECT id FROM products WHERE name = 'carrots'), NULL, 1.30, 'kg', 'EUR', 'Marché de Rungis'),
((SELECT id FROM products WHERE name = 'apple'), NULL, 2.20, 'kg', 'EUR', 'Marché de Rungis');

-- Prix spécifiques à certaines variétés (plus chères)
INSERT INTO product_prices (product_id, variety_id, price, unit, currency, market) VALUES
((SELECT id FROM products WHERE name = 'tomato'), (SELECT id FROM product_varieties WHERE name = 'Cœur de Bœuf'), 4.50, 'kg', 'EUR', 'Marché de producteurs'),
((SELECT id FROM products WHERE name = 'tomato'), (SELECT id FROM product_varieties WHERE name = 'Cerise'), 5.90, 'kg', 'EUR', 'Marché de producteurs'),
((SELECT id FROM products WHERE name = 'potatoes'), (SELECT id FROM product_varieties WHERE name = 'Vitelotte'), 3.80, 'kg', 'EUR', 'Marché de producteurs');


-- ============ SAISONS DES RECETTES ============

INSERT INTO recipe_seasons (recipe_id, season_id, note)
SELECT DISTINCT id, (SELECT id FROM seasons WHERE name_fr = 'Automne'), 'Recette automnale (courge / potiron)'
FROM recipes_new
WHERE recipe_title ILIKE '%pumpkin%' OR recipe_title ILIKE '%squash%'
ON CONFLICT (recipe_id, season_id) DO NOTHING;

INSERT INTO recipe_seasons (recipe_id, season_id, note)
SELECT DISTINCT id, (SELECT id FROM seasons WHERE name_fr = 'Printemps'), 'Recette de printemps (asperges)'
FROM recipes_new
WHERE recipe_title ILIKE '%asparagus%'
ON CONFLICT (recipe_id, season_id) DO NOTHING;

INSERT INTO recipe_seasons (recipe_id, season_id, note)
SELECT DISTINCT id, (SELECT id FROM seasons WHERE name_fr = 'Été'), 'Recette estivale et fraîche'
FROM recipes_new
WHERE recipe_title ILIKE '%gazpacho%' OR recipe_title ILIKE '%watermelon%'
ON CONFLICT (recipe_id, season_id) DO NOTHING;

INSERT INTO recipe_seasons (recipe_id, season_id, note)
SELECT DISTINCT id, (SELECT id FROM seasons WHERE name_fr = 'Hiver'), 'Plat mijoté réconfortant d''hiver'
FROM recipes_new
WHERE recipe_title ILIKE '%stew%' OR recipe_title ILIKE '%chili%'
ON CONFLICT (recipe_id, season_id) DO NOTHING;


-- ============ SPÉCIALITÉS RÉGIONALES DES RECETTES ============

INSERT INTO recipe_specialties (recipe_id, country_id, region_id, description)
SELECT DISTINCT id, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM regions WHERE name_fr='Bretagne'), 'Spécialité bretonne'
FROM recipes_new
WHERE recipe_title ILIKE '%crepe%' OR recipe_title ILIKE '%crêpe%' OR recipe_title ILIKE '%galette%';

INSERT INTO recipe_specialties (recipe_id, country_id, region_id, description)
SELECT DISTINCT id, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM regions WHERE name_fr='Grand Est'), 'Spécialité lorraine'
FROM recipes_new
WHERE recipe_title ILIKE '%quiche lorraine%';

INSERT INTO recipe_specialties (recipe_id, country_id, region_id, description)
SELECT DISTINCT id, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM regions WHERE name_fr='Provence-Alpes-Côte d''Azur'), 'Spécialité provençale'
FROM recipes_new
WHERE recipe_title ILIKE '%ratatouille%';

INSERT INTO recipe_specialties (recipe_id, country_id, region_id, description)
SELECT DISTINCT id, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM regions WHERE name_fr='Bourgogne-Franche-Comté'), 'Spécialité bourguignonne'
FROM recipes_new
WHERE recipe_title ILIKE '%bourguignon%';

INSERT INTO recipe_specialties (recipe_id, country_id, region_id, description)
SELECT DISTINCT id, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM regions WHERE name_fr='Occitanie'), 'Spécialité du Sud-Ouest'
FROM recipes_new
WHERE recipe_title ILIKE '%cassoulet%';

INSERT INTO recipe_specialties (recipe_id, country_id, region_id, description)
SELECT DISTINCT id, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM regions WHERE name_fr='Auvergne-Rhône-Alpes'), 'Spécialité savoyarde'
FROM recipes_new
WHERE recipe_title ILIKE '%tartiflette%';

INSERT INTO recipe_specialties (recipe_id, country_id, region_id, description)
SELECT DISTINCT id, (SELECT id FROM countries WHERE code_iso='FR'), (SELECT id FROM regions WHERE name_fr='Centre-Val de Loire'), 'Spécialité de Sologne'
FROM recipes_new
WHERE recipe_title ILIKE '%tarte tatin%';
