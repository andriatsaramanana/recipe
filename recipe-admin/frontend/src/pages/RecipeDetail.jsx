import { useEffect, useState, useCallback, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import api from '../services/api';

export default function RecipeDetail({ recipeId, onHide, onSaved }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cost, setCost] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [newSeason, setNewSeason] = useState({ season_id: null, note: '' });
  const [newSpecialty, setNewSpecialty] = useState({ country_id: null, region_id: null, description: '' });
  const [newIngredient, setNewIngredient] = useState({ product: null, quantity: '', unit: '' });
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [newStep, setNewStep] = useState('');
  const toast = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/recipes/${recipeId}`);
      setRecipe(res.data);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    load();
    api.get('/categories').then(res => setCategories(res.data.map(c => ({ label: c.name_fr || c.name_en, value: c.id }))));
    api.get('/subcategories').then(res => setSubcategories(res.data));
    api.get('/seasons').then(res => setSeasons(res.data.map(s => ({ label: `${s.emoji || ''} ${s.name_fr}`.trim(), value: s.id }))));
    api.get('/countries').then(res => setCountries(res.data.map(c => ({ label: c.name_fr, value: c.id }))));
    api.get('/regions').then(res => setRegions(res.data.map(r => ({ label: r.name_fr, value: r.id }))));
  }, [load]);

  const loadCost = useCallback(() => {
    api.get(`/recipes/${recipeId}/cost`).then(res => setCost(res.data));
  }, [recipeId]);

  const subcategoryOptions = recipe
    ? subcategories.filter(s => s.category_id === recipe.category_id).map(s => ({ label: s.name_fr || s.name_en, value: s.id }))
    : [];

  const saveInfo = async () => {
    try {
      await api.put(`/recipes/${recipeId}`, {
        recipe_title: recipe.recipe_title,
        description: recipe.description,
        category_id: recipe.category_id,
        subcategory_id: recipe.subcategory_id,
      });
      toast.current?.show({ severity: 'success', summary: 'Recette mise à jour', life: 2000 });
      onSaved?.();
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.response?.data?.error || err.message });
    }
  };

  const addSeason = async () => {
    if (!newSeason.season_id) return;
    try {
      await api.post('/recipe-seasons', { recipe_id: recipeId, season_id: newSeason.season_id, note: newSeason.note || null });
      setNewSeason({ season_id: null, note: '' });
      load();
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.response?.data?.error || err.message });
    }
  };

  const removeSeason = async (id) => {
    await api.delete(`/recipe-seasons/${id}`);
    load();
  };

  const addSpecialty = async () => {
    if (!newSpecialty.country_id && !newSpecialty.region_id) return;
    try {
      await api.post('/recipe-specialties', {
        recipe_id: recipeId,
        country_id: newSpecialty.country_id,
        region_id: newSpecialty.region_id,
        description: newSpecialty.description || null,
      });
      setNewSpecialty({ country_id: null, region_id: null, description: '' });
      load();
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.response?.data?.error || err.message });
    }
  };

  const removeSpecialty = async (id) => {
    await api.delete(`/recipe-specialties/${id}`);
    load();
  };

  const searchProducts = async (e) => {
    const res = await api.get('/products/search', { params: { q: e.query } });
    setProductSuggestions(res.data);
  };

  const addIngredient = async () => {
    if (!newIngredient.product?.id) return;
    try {
      await api.post('/ingredients', {
        recipe_id: recipeId,
        product_id: newIngredient.product.id,
        quantity: newIngredient.quantity || null,
        unit: newIngredient.unit || null,
      });
      setNewIngredient({ product: null, quantity: '', unit: '' });
      load();
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.response?.data?.error || err.message });
    }
  };

  const removeIngredient = async (id) => {
    await api.delete(`/ingredients/${id}`);
    load();
  };

  const addStep = async () => {
    if (!newStep.trim()) return;
    try {
      await api.post('/directions', { recipe_id: recipeId, instruction: newStep.trim() });
      setNewStep('');
      load();
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.response?.data?.error || err.message });
    }
  };

  const removeStep = async (id) => {
    await api.delete(`/directions/${id}`);
    load();
  };

  return (
    <Dialog visible header={recipe ? recipe.recipe_title : 'Chargement...'} style={{ width: '70vw' }} onHide={onHide} maximizable>
      <Toast ref={toast} />
      {loading || !recipe ? <p>Chargement...</p> : (
        <TabView activeIndex={activeIndex} onTabChange={(e) => { setActiveIndex(e.index); if (e.index === 5 && !cost) loadCost(); }}>
          <TabPanel header="Infos">
            <div className="flex flex-column gap-3 mt-2" style={{ maxWidth: '600px' }}>
              <div className="flex flex-column gap-1">
                <label>Titre</label>
                <InputText value={recipe.recipe_title || ''} onChange={(e) => setRecipe({ ...recipe, recipe_title: e.target.value })} />
              </div>
              <div className="flex flex-column gap-1">
                <label>Description</label>
                <InputTextarea value={recipe.description || ''} onChange={(e) => setRecipe({ ...recipe, description: e.target.value })} rows={4} />
              </div>
              <div className="flex flex-column gap-1">
                <label>Catégorie</label>
                <Dropdown value={recipe.category_id} options={categories} onChange={(e) => setRecipe({ ...recipe, category_id: e.value, subcategory_id: null })} filter showClear />
              </div>
              <div className="flex flex-column gap-1">
                <label>Sous-catégorie</label>
                <Dropdown value={recipe.subcategory_id} options={subcategoryOptions} onChange={(e) => setRecipe({ ...recipe, subcategory_id: e.value })} filter showClear />
              </div>
              <Button label="Enregistrer" icon="pi pi-check" onClick={saveInfo} className="align-self-start" />
            </div>
          </TabPanel>

          <TabPanel header="Ingrédients">
            <DataTable value={recipe.ingredients} size="small" stripedRows emptyMessage="Aucun ingrédient">
              <Column field="position" header="#" style={{ width: '60px' }} />
              <Column field="product" header="Produit" />
              <Column field="quantity" header="Quantité" style={{ width: '100px' }} />
              <Column field="unit" header="Unité" style={{ width: '100px' }} />
              <Column field="raw_text" header="Texte brut" />
              <Column body={(row) => <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removeIngredient(row.id)} />} style={{ width: '60px' }} />
            </DataTable>
            <div className="flex gap-2 mt-3 align-items-end flex-wrap">
              <div className="flex flex-column gap-1 flex-grow-1">
                <label>Produit</label>
                <AutoComplete
                  value={newIngredient.product}
                  suggestions={productSuggestions}
                  completeMethod={searchProducts}
                  field="name"
                  placeholder="Rechercher un produit..."
                  onChange={(e) => setNewIngredient({ ...newIngredient, product: e.value })}
                  forceSelection
                  style={{ minWidth: '220px' }}
                />
              </div>
              <div className="flex flex-column gap-1">
                <label>Quantité</label>
                <InputText value={newIngredient.quantity} onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })} style={{ width: '100px' }} />
              </div>
              <div className="flex flex-column gap-1">
                <label>Unité</label>
                <InputText value={newIngredient.unit} onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })} style={{ width: '100px' }} />
              </div>
              <Button label="Ajouter" icon="pi pi-plus" onClick={addIngredient} />
            </div>
          </TabPanel>

          <TabPanel header="Étapes">
            <ol>
              {recipe.directions.map(d => (
                <li key={d.id} className="mb-2 flex align-items-center justify-content-between gap-2">
                  <span>{d.instruction}</span>
                  <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removeStep(d.id)} />
                </li>
              ))}
            </ol>
            <div className="flex gap-2 mt-3 align-items-end">
              <div className="flex flex-column gap-1 flex-grow-1">
                <label>Nouvelle étape</label>
                <InputTextarea value={newStep} onChange={(e) => setNewStep(e.target.value)} rows={2} />
              </div>
              <Button label="Ajouter" icon="pi pi-plus" onClick={addStep} />
            </div>
          </TabPanel>

          <TabPanel header="Saisons">
            <DataTable value={recipe.seasons} size="small" stripedRows emptyMessage="Aucune saison associée">
              <Column header="Saison" body={(row) => `${row.emoji || ''} ${row.name_fr}`.trim()} />
              <Column field="note" header="Note" />
              <Column body={(row) => <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removeSeason(row.id)} />} style={{ width: '60px' }} />
            </DataTable>
            <div className="flex gap-2 mt-3 align-items-end flex-wrap">
              <div className="flex flex-column gap-1">
                <label>Saison</label>
                <Dropdown value={newSeason.season_id} options={seasons} onChange={(e) => setNewSeason({ ...newSeason, season_id: e.value })} placeholder="Saison" style={{ minWidth: '160px' }} />
              </div>
              <div className="flex flex-column gap-1 flex-grow-1">
                <label>Note</label>
                <InputText value={newSeason.note} onChange={(e) => setNewSeason({ ...newSeason, note: e.target.value })} />
              </div>
              <Button label="Ajouter" icon="pi pi-plus" onClick={addSeason} />
            </div>
          </TabPanel>

          <TabPanel header="Spécialités">
            <DataTable value={recipe.specialties} size="small" stripedRows emptyMessage="Aucune spécialité associée">
              <Column field="country_fr" header="Pays" />
              <Column field="region_fr" header="Région" />
              <Column field="description" header="Description" />
              <Column body={(row) => <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removeSpecialty(row.id)} />} style={{ width: '60px' }} />
            </DataTable>
            <div className="flex gap-2 mt-3 align-items-end flex-wrap">
              <div className="flex flex-column gap-1">
                <label>Pays</label>
                <Dropdown value={newSpecialty.country_id} options={countries} onChange={(e) => setNewSpecialty({ ...newSpecialty, country_id: e.value })} placeholder="Pays" showClear filter style={{ minWidth: '160px' }} />
              </div>
              <div className="flex flex-column gap-1">
                <label>Région</label>
                <Dropdown value={newSpecialty.region_id} options={regions} onChange={(e) => setNewSpecialty({ ...newSpecialty, region_id: e.value })} placeholder="Région" showClear filter style={{ minWidth: '180px' }} />
              </div>
              <div className="flex flex-column gap-1 flex-grow-1">
                <label>Description</label>
                <InputText value={newSpecialty.description} onChange={(e) => setNewSpecialty({ ...newSpecialty, description: e.target.value })} />
              </div>
              <Button label="Ajouter" icon="pi pi-plus" onClick={addSpecialty} />
            </div>
          </TabPanel>

          <TabPanel header="Coût">
            {!cost ? (
              <Button label="Calculer le coût" icon="pi pi-calculator" onClick={loadCost} />
            ) : (
              <>
                <DataTable value={cost.details} size="small" stripedRows>
                  <Column field="product" header="Produit" />
                  <Column field="quantity" header="Quantité" style={{ width: '90px' }} />
                  <Column field="unit" header="Unité" style={{ width: '90px' }} />
                  <Column header="Prix réf." body={(row) => row.price ? `${row.price} €/${row.price_unit}` : '—'} />
                  <Column header="Coût" body={(row) => row.cost != null ? `${row.cost.toFixed(2)} €` : 'N/A'} />
                </DataTable>
                <h3>Total estimé : {cost.total.toFixed(2)} {cost.currency}</h3>
              </>
            )}
          </TabPanel>
        </TabView>
      )}
    </Dialog>
  );
}
