const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: '127.0.0.1',
  database: 'recipes_db',
  user: 'postgres',
  password: 'admin123',
  port: 5432,
});

app.get('/api/recipes/search', async (req, res) => {
  const { product, limit = 20 } = req.query;
  if (!product) return res.json([]);

  try {
    // Étape 1 : trouver les IDs des recettes
    const recipeIds = await pool.query(`
      SELECT DISTINCT i.recipe_id
      FROM ingredients i
      JOIN products p ON p.id = i.product_id
      WHERE p.name ILIKE $1
      LIMIT $2;
    `, [`%${product}%`, parseInt(limit)]);

    if (recipeIds.rows.length === 0) return res.json([]);

    const ids = recipeIds.rows.map(r => r.recipe_id);

    const result = [];

    for (const id of ids) {
      // Infos recette
      const recipeRes = await pool.query(`
        SELECT r.id, r.recipe_title, c.name_fr AS category_fr,
               r.num_ingredients, r.num_steps, r.description
        FROM recipes_new r
        JOIN categories c ON c.id = r.category_id
        WHERE r.id = $1;
      `, [id]);

      if (recipeRes.rows.length === 0) continue;
      const recipe = recipeRes.rows[0];

      // Ingrédients
      const ingRes = await pool.query(`
        SELECT p.name AS product, i.quantity, i.unit
        FROM ingredients i
        JOIN products p ON p.id = i.product_id
        WHERE i.recipe_id = $1
        ORDER BY i.position;
      `, [id]);

      // Étapes
      const dirRes = await pool.query(`
        SELECT instruction
        FROM directions
        WHERE recipe_id = $1
        ORDER BY step_number;
      `, [id]);

      result.push({
        ...recipe,
        ingredients: ingRes.rows,
        directions: dirRes.rows.map(d => d.instruction),
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Liste paginée des recettes avec filtres
app.get('/api/recipes', async (req, res) => {
  const { search, category_id, subcategory_id, season_id, page = 1, limit = 20 } = req.query;

  try {
    const conditions = [];
    const values = [];
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`r.recipe_title ILIKE $${values.length}`);
    }
    if (category_id) {
      values.push(category_id);
      conditions.push(`r.category_id = $${values.length}`);
    }
    if (subcategory_id) {
      values.push(subcategory_id);
      conditions.push(`r.subcategory_id = $${values.length}`);
    }
    if (season_id) {
      values.push(season_id);
      conditions.push(`r.id IN (SELECT recipe_id FROM recipe_seasons WHERE season_id = $${values.length})`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT count(*) FROM recipes_new r ${where}`, values);

    const dataValues = [...values, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)];
    const dataRes = await pool.query(`
      SELECT r.id, r.recipe_title, r.num_ingredients, r.num_steps,
             c.name_fr AS category_fr, sc.name_fr AS subcategory_fr
      FROM recipes_new r
      LEFT JOIN categories c ON c.id = r.category_id
      LEFT JOIN subcategories sc ON sc.id = r.subcategory_id
      ${where}
      ORDER BY r.id
      LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
    `, dataValues);

    res.json({
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      data: dataRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Détail d'une recette : ingrédients, étapes, saisons, spécialités
app.get('/api/recipes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const recipeRes = await pool.query(`
      SELECT r.*, c.name_fr AS category_fr, sc.name_fr AS subcategory_fr
      FROM recipes_new r
      LEFT JOIN categories c ON c.id = r.category_id
      LEFT JOIN subcategories sc ON sc.id = r.subcategory_id
      WHERE r.id = $1
    `, [id]);
    if (recipeRes.rows.length === 0) return res.status(404).json({ error: 'Recette non trouvée' });

    const ingredientsRes = await pool.query(`
      SELECT i.id, i.quantity, i.unit, i.raw_text, i.position, p.id AS product_id, p.name AS product
      FROM ingredients i
      JOIN products p ON p.id = i.product_id
      WHERE i.recipe_id = $1
      ORDER BY i.position
    `, [id]);

    const directionsRes = await pool.query(`
      SELECT step_number, instruction FROM directions WHERE recipe_id = $1 ORDER BY step_number
    `, [id]);

    const seasonsRes = await pool.query(`
      SELECT rs.id, s.id AS season_id, s.name_fr, s.emoji, rs.note
      FROM recipe_seasons rs
      JOIN seasons s ON s.id = rs.season_id
      WHERE rs.recipe_id = $1
    `, [id]);

    const specialtiesRes = await pool.query(`
      SELECT rsp.id, c.name_fr AS country_fr, reg.name_fr AS region_fr, rsp.description
      FROM recipe_specialties rsp
      LEFT JOIN countries c ON c.id = rsp.country_id
      LEFT JOIN regions reg ON reg.id = rsp.region_id
      WHERE rsp.recipe_id = $1
    `, [id]);

    res.json({
      ...recipeRes.rows[0],
      ingredients: ingredientsRes.rows,
      directions: directionsRes.rows,
      seasons: seasonsRes.rows,
      specialties: specialtiesRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Mise à jour des champs principaux d'une recette
app.put('/api/recipes/:id', async (req, res) => {
  const fields = ['recipe_title', 'description', 'category_id', 'subcategory_id'];
  const keys = fields.filter(f => req.body[f] !== undefined);
  if (keys.length === 0) return res.status(400).json({ error: 'Aucun champ valide fourni' });

  try {
    const values = keys.map(k => req.body[k]);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE recipes_new SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Non trouvé' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM recipes_new WHERE id = $1 RETURNING id`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Non trouvé' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Estimation du coût d'une recette à partir des prix produits (poids uniquement : g/kg)
app.get('/api/recipes/:id/cost', async (req, res) => {
  const WEIGHT_TO_KG = { kg: 1, g: 0.001 };

  try {
    const ingRes = await pool.query(`
      SELECT i.id, p.name AS product, i.quantity, i.unit,
             pp.price, pp.unit AS price_unit
      FROM ingredients i
      JOIN products p ON p.id = i.product_id
      LEFT JOIN LATERAL (
        SELECT price, unit FROM product_prices
        WHERE product_id = i.product_id AND variety_id IS NULL
        LIMIT 1
      ) pp ON true
      WHERE i.recipe_id = $1
      ORDER BY i.position
    `, [req.params.id]);

    let total = 0;
    const details = ingRes.rows.map(row => {
      const qty = parseFloat(row.quantity);
      const fromUnit = WEIGHT_TO_KG[row.unit?.toLowerCase()];
      const toUnit = WEIGHT_TO_KG[row.price_unit?.toLowerCase()];
      let cost = null;

      if (row.price && !isNaN(qty)) {
        if (fromUnit && toUnit) {
          cost = (qty * fromUnit / toUnit) * row.price;
        } else if (row.unit?.toLowerCase() === row.price_unit?.toLowerCase()) {
          cost = qty * row.price;
        }
      }
      if (cost !== null) total += cost;
      return { ...row, cost };
    });

    res.json({
      recipe_id: parseInt(req.params.id),
      total: Math.round(total * 100) / 100,
      currency: 'EUR',
      details,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Statistiques pour le tableau de bord
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT count(*) FROM recipes_new) AS recipes,
        (SELECT count(*) FROM products) AS products,
        (SELECT count(*) FROM categories) AS categories,
        (SELECT count(*) FROM subcategories) AS subcategories,
        (SELECT count(*) FROM countries) AS countries,
        (SELECT count(*) FROM regions) AS regions,
        (SELECT count(*) FROM seasons) AS seasons,
        (SELECT count(*) FROM product_varieties) AS varieties,
        (SELECT count(*) FROM recipe_specialties) AS specialties,
        (SELECT count(*) FROM recipe_seasons) AS recipe_seasons
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// CRUD générique pour les tables de référence (saisons, géographie, variétés, prix, spécialités)
const TABLES = {
  categories: { table: 'categories', columns: ['name_en', 'name_fr'], filters: [] },
  subcategories: { table: 'subcategories', columns: ['name_en', 'name_fr', 'category_id'], filters: ['category_id'] },
  products: { table: 'products', columns: ['name'], filters: [] },
  countries: { table: 'countries', columns: ['name_fr', 'name_en', 'code_iso'], filters: [] },
  regions: { table: 'regions', columns: ['name_fr', 'name_en', 'country_id'], filters: ['country_id'] },
  seasons: { table: 'seasons', columns: ['name_fr', 'name_en', 'month_start', 'month_end', 'emoji'], filters: [] },
  'product-varieties': { table: 'product_varieties', columns: ['product_id', 'name', 'description', 'region_id', 'country_id', 'season_id'], filters: ['product_id', 'region_id', 'country_id'] },
  'product-prices': { table: 'product_prices', columns: ['product_id', 'variety_id', 'price', 'unit', 'currency', 'market'], filters: ['product_id', 'variety_id'] },
  'recipe-specialties': { table: 'recipe_specialties', columns: ['recipe_id', 'country_id', 'region_id', 'description'], filters: ['recipe_id', 'country_id', 'region_id'] },
  'product-seasons': { table: 'product_seasons', columns: ['product_id', 'season_id', 'note'], filters: ['product_id', 'season_id'] },
  'recipe-seasons': { table: 'recipe_seasons', columns: ['recipe_id', 'season_id', 'note'], filters: ['recipe_id', 'season_id'] },
};

for (const [route, { table, columns, filters }] of Object.entries(TABLES)) {
  const path = `/api/${route}`;

  app.get(path, async (req, res) => {
    try {
      const conditions = [];
      const values = [];
      for (const f of filters) {
        if (req.query[f] !== undefined) {
          values.push(req.query[f]);
          conditions.push(`${f} = $${values.length}`);
        }
      }
      const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
      const result = await pool.query(`SELECT * FROM ${table}${where} ORDER BY id`, values);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get(`${path}/:id`, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Non trouvé' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post(path, async (req, res) => {
    try {
      const keys = columns.filter(c => req.body[c] !== undefined);
      if (keys.length === 0) return res.status(400).json({ error: 'Aucun champ valide fourni' });
      const values = keys.map(k => req.body[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put(`${path}/:id`, async (req, res) => {
    try {
      const keys = columns.filter(c => req.body[c] !== undefined);
      if (keys.length === 0) return res.status(400).json({ error: 'Aucun champ valide fourni' });
      const values = keys.map(k => req.body[k]);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      values.push(req.params.id);
      const result = await pool.query(
        `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Non trouvé' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete(`${path}/:id`, async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Non trouvé' });
      res.json({ deleted: result.rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
}

app.listen(3001, () => console.log('✅ API démarrée sur http://localhost:3001'));
