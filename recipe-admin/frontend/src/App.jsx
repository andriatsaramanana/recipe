import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RecipesPage from './pages/RecipesPage';
import ReferencePage from './pages/ReferencePage';

const NAV_GROUPS = [
  {
    label: 'Recettes',
    items: [
      { to: '/', label: 'Tableau de bord', icon: 'pi pi-home' },
      { to: '/recipes', label: 'Recettes', icon: 'pi pi-book' },
      { to: '/ref/categories', label: 'Catégories', icon: 'pi pi-tags' },
      { to: '/ref/subcategories', label: 'Sous-catégories', icon: 'pi pi-tag' },
      { to: '/ref/products', label: 'Produits', icon: 'pi pi-shopping-cart' },
    ],
  },
  {
    label: 'Géographie',
    items: [
      { to: '/ref/countries', label: 'Pays', icon: 'pi pi-flag' },
      { to: '/ref/regions', label: 'Régions', icon: 'pi pi-map' },
      { to: '/ref/recipe-specialties', label: 'Spécialités régionales', icon: 'pi pi-star' },
    ],
  },
  {
    label: 'Saisonnalité',
    items: [
      { to: '/ref/seasons', label: 'Saisons', icon: 'pi pi-sun' },
      { to: '/ref/recipe-seasons', label: 'Saisons des recettes', icon: 'pi pi-calendar' },
    ],
  },
  {
    label: 'Variétés & Prix',
    items: [
      { to: '/ref/product-varieties', label: 'Variétés de produits', icon: 'pi pi-sitemap' },
      { to: '/ref/product-prices', label: 'Prix des produits', icon: 'pi pi-euro' },
    ],
  },
];

export default function App() {
  return (
    <div className="flex h-screen">
      <aside className="w-16rem flex-shrink-0 surface-card border-right-1 surface-border overflow-y-auto p-3">
        <h3 className="mt-0 mb-4 text-center">🍽️ Recipe Admin</h3>
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-4">
            <div className="text-xs font-bold text-color-secondary uppercase mb-2">{group.label}</div>
            <ul className="list-none p-0 m-0 flex flex-column gap-1">
              {group.items.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex align-items-center gap-2 p-2 border-round no-underline text-color ${isActive ? 'surface-200 font-bold' : ''}`
                    }
                  >
                    <i className={item.icon} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <main className="flex-grow-1 overflow-y-auto p-4 surface-ground">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/ref/:resource" element={<ReferencePage />} />
        </Routes>
      </main>
    </div>
  );
}
