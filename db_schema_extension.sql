-- Extension du schéma : saisons, géographie, variétés, prix, spécialités régionales
-- À appliquer sur recipes_db

-- Saisons
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    name_fr VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    month_start SMALLINT NOT NULL CHECK (month_start BETWEEN 1 AND 12),
    month_end SMALLINT NOT NULL CHECK (month_end BETWEEN 1 AND 12),
    emoji VARCHAR(10)
);

-- Pays
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name_fr VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    code_iso VARCHAR(3) UNIQUE
);

-- Régions (rattachées à un pays)
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name_fr VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    country_id INTEGER REFERENCES countries(id)
);
CREATE INDEX idx_regions_country ON regions(country_id);

-- Variétés d'un produit (ex: salade Batavia / Feuille de Chêne)
CREATE TABLE product_varieties (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    region_id INTEGER REFERENCES regions(id),
    country_id INTEGER REFERENCES countries(id),
    season_id INTEGER REFERENCES seasons(id)
);
CREATE INDEX idx_varieties_product ON product_varieties(product_id);

-- Prix des produits (par unité / marché)
CREATE TABLE product_prices (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    variety_id INTEGER REFERENCES product_varieties(id),
    price NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    market VARCHAR(200)
);
CREATE INDEX idx_prices_product ON product_prices(product_id);

-- Spécialités régionales d'une recette (ex: crêpe -> Bretagne)
CREATE TABLE recipe_specialties (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes_new(id) ON DELETE CASCADE,
    country_id INTEGER REFERENCES countries(id),
    region_id INTEGER REFERENCES regions(id),
    description TEXT
);
CREATE INDEX idx_specialties_recipe ON recipe_specialties(recipe_id);

-- Saisonnalité des produits (ex: concombre -> été)
CREATE TABLE product_seasons (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    season_id INTEGER NOT NULL REFERENCES seasons(id),
    note TEXT,
    UNIQUE (product_id, season_id)
);
CREATE INDEX idx_product_seasons_product ON product_seasons(product_id);

-- Saisonnalité des recettes (ex: raclette -> hiver)
CREATE TABLE recipe_seasons (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes_new(id) ON DELETE CASCADE,
    season_id INTEGER NOT NULL REFERENCES seasons(id),
    note TEXT,
    UNIQUE (recipe_id, season_id)
);
CREATE INDEX idx_recipe_seasons_recipe ON recipe_seasons(recipe_id);


-- Données de référence : saisons
INSERT INTO seasons (name_fr, name_en, month_start, month_end, emoji) VALUES
('Printemps', 'Spring', 3, 5, '🌱'),
('Été', 'Summer', 6, 8, '☀️'),
('Automne', 'Autumn', 9, 11, '🍂'),
('Hiver', 'Winter', 12, 2, '❄️');

-- Données de référence : France + régions métropolitaines
INSERT INTO countries (name_fr, name_en, code_iso) VALUES
('France', 'France', 'FR');

INSERT INTO regions (name_fr, name_en, country_id) VALUES
('Auvergne-Rhône-Alpes', 'Auvergne-Rhône-Alpes', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Bourgogne-Franche-Comté', 'Bourgogne-Franche-Comté', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Bretagne', 'Brittany', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Centre-Val de Loire', 'Centre-Val de Loire', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Corse', 'Corsica', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Grand Est', 'Grand Est', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Hauts-de-France', 'Hauts-de-France', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Île-de-France', 'Île-de-France', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Normandie', 'Normandy', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Nouvelle-Aquitaine', 'Nouvelle-Aquitaine', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Occitanie', 'Occitanie', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Pays de la Loire', 'Pays de la Loire', (SELECT id FROM countries WHERE code_iso = 'FR')),
('Provence-Alpes-Côte d''Azur', 'Provence-Alpes-Côte d''Azur', (SELECT id FROM countries WHERE code_iso = 'FR'));
