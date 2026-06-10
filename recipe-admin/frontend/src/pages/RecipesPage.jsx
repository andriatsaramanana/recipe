import { useEffect, useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import api from '../services/api';
import RecipeDetail from './RecipeDetail';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [seasonId, setSeasonId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.map(c => ({ label: c.name_fr || c.name_en, value: c.id }))));
    api.get('/seasons').then(res => setSeasons(res.data.map(s => ({ label: `${s.emoji || ''} ${s.name_fr}`.trim(), value: s.id }))));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: rows };
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;
      if (seasonId) params.season_id = seasonId;
      const res = await api.get('/recipes', { params });
      setRecipes(res.data.data);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [page, rows, search, categoryId, seasonId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="card">
      <h2 className="mt-0">Recettes</h2>

      <div className="flex flex-wrap gap-3 mb-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Rechercher un titre..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
        </span>
        <Dropdown
          value={categoryId}
          options={categories}
          onChange={(e) => { setPage(1); setCategoryId(e.value); }}
          placeholder="Catégorie"
          showClear
          filter
          style={{ minWidth: '220px' }}
        />
        <Dropdown
          value={seasonId}
          options={seasons}
          onChange={(e) => { setPage(1); setSeasonId(e.value); }}
          placeholder="Saison"
          showClear
          style={{ minWidth: '180px' }}
        />
      </div>

      <DataTable
        value={recipes}
        loading={loading}
        lazy
        paginator
        first={(page - 1) * rows}
        rows={rows}
        totalRecords={total}
        onPage={(e) => { setPage(e.page + 1); setRows(e.rows); }}
        rowsPerPageOptions={[10, 20, 50]}
        size="small"
        stripedRows
        selectionMode="single"
        onSelectionChange={(e) => setSelectedId(e.value.id)}
        emptyMessage="Aucune recette trouvée"
      >
        <Column field="id" header="ID" style={{ width: '80px' }} />
        <Column field="recipe_title" header="Titre" />
        <Column field="category_fr" header="Catégorie" />
        <Column field="num_ingredients" header="# Ingrédients" style={{ width: '130px' }} />
        <Column field="num_steps" header="# Étapes" style={{ width: '110px' }} />
      </DataTable>

      {selectedId && (
        <RecipeDetail
          recipeId={selectedId}
          onHide={() => setSelectedId(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
