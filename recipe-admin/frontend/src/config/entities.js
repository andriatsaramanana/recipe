// Configuration des champs pour CrudManager, par ressource API
export const ENTITIES = {
  categories: {
    title: 'Catégories',
    fields: [
      { name: 'name_en', label: 'Nom (EN)' },
      { name: 'name_fr', label: 'Nom (FR)' },
    ],
  },
  subcategories: {
    title: 'Sous-catégories',
    fields: [
      { name: 'name_en', label: 'Nom (EN)' },
      { name: 'name_fr', label: 'Nom (FR)' },
      { name: 'category_id', label: 'Catégorie', type: 'select', optionsResource: 'categories', optionLabelField: 'name_fr' },
    ],
  },
  products: {
    title: 'Produits',
    fields: [
      { name: 'name', label: 'Nom' },
    ],
  },
  countries: {
    title: 'Pays',
    fields: [
      { name: 'name_fr', label: 'Nom (FR)' },
      { name: 'name_en', label: 'Nom (EN)' },
      { name: 'code_iso', label: 'Code ISO' },
    ],
  },
  regions: {
    title: 'Régions',
    fields: [
      { name: 'name_fr', label: 'Nom (FR)' },
      { name: 'name_en', label: 'Nom (EN)' },
      { name: 'country_id', label: 'Pays', type: 'select', optionsResource: 'countries', optionLabelField: 'name_fr' },
    ],
  },
  seasons: {
    title: 'Saisons',
    fields: [
      { name: 'name_fr', label: 'Nom (FR)' },
      { name: 'name_en', label: 'Nom (EN)' },
      { name: 'month_start', label: 'Mois début', type: 'number', maxFractionDigits: 0 },
      { name: 'month_end', label: 'Mois fin', type: 'number', maxFractionDigits: 0 },
      { name: 'emoji', label: 'Emoji' },
    ],
  },
  'product-varieties': {
    title: 'Variétés de produits',
    fields: [
      { name: 'product_id', label: 'Produit', type: 'select', optionsResource: 'products', optionLabelField: 'name' },
      { name: 'name', label: 'Nom de la variété' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'region_id', label: 'Région', type: 'select', optionsResource: 'regions', optionLabelField: 'name_fr' },
      { name: 'country_id', label: 'Pays', type: 'select', optionsResource: 'countries', optionLabelField: 'name_fr' },
      { name: 'season_id', label: 'Saison', type: 'select', optionsResource: 'seasons', optionLabelField: 'name_fr' },
    ],
  },
  'product-prices': {
    title: 'Prix des produits',
    fields: [
      { name: 'product_id', label: 'Produit', type: 'select', optionsResource: 'products', optionLabelField: 'name' },
      { name: 'variety_id', label: 'Variété', type: 'select', optionsResource: 'product-varieties', optionLabelField: 'name' },
      { name: 'price', label: 'Prix', type: 'number', maxFractionDigits: 2 },
      { name: 'unit', label: 'Unité' },
      { name: 'currency', label: 'Devise' },
      { name: 'market', label: 'Marché' },
    ],
  },
  'recipe-specialties': {
    title: 'Spécialités régionales (recettes)',
    fields: [
      { name: 'recipe_id', label: 'ID recette', type: 'number', maxFractionDigits: 0 },
      { name: 'country_id', label: 'Pays', type: 'select', optionsResource: 'countries', optionLabelField: 'name_fr' },
      { name: 'region_id', label: 'Région', type: 'select', optionsResource: 'regions', optionLabelField: 'name_fr' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  'recipe-seasons': {
    title: 'Saisons des recettes',
    fields: [
      { name: 'recipe_id', label: 'ID recette', type: 'number', maxFractionDigits: 0 },
      { name: 'season_id', label: 'Saison', type: 'select', optionsResource: 'seasons', optionLabelField: 'name_fr' },
      { name: 'note', label: 'Note' },
    ],
  },
};
