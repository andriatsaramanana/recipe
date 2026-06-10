import { useEffect, useState } from 'react';
import api from '../services/api';

const LABELS = {
  recipes: 'Recettes',
  products: 'Produits',
  categories: 'Catégories',
  subcategories: 'Sous-catégories',
  countries: 'Pays',
  regions: 'Régions',
  seasons: 'Saisons',
  varieties: 'Variétés de produits',
  specialties: 'Spécialités régionales',
  recipe_seasons: 'Associations recette ↔ saison',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data)).catch(() => setStats({}));
  }, []);

  return (
    <div>
      <h2>Tableau de bord</h2>
      <div className="grid">
        {stats && Object.entries(LABELS).map(([key, label]) => (
          <div key={key} className="col-12 sm:col-6 lg:col-3">
            <div className="card text-center">
              <div className="text-3xl font-bold">{Number(stats[key] ?? 0).toLocaleString('fr-FR')}</div>
              <div className="text-color-secondary">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
