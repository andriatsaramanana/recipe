import { useState, useEffect, useCallback } from "react";

// ─── CONFIG API ───────────────────────────────────────────────────────────────
// Remplacez par l'URL de votre API backend
const API_BASE = "http://localhost:3001";

// ─── MOCK DATA (pour démonstration sans backend) ──────────────────────────────
const MOCK_RECIPES = [
  {
    id: 1,
    recipe_title: "Air Fryer Potato Slices with Dipping Sauce",
    category_fr: "Recettes à la Friteuse à Air",
    num_ingredients: 9,
    num_steps: 5,
    description: "Ces tranches de pommes de terre à la friteuse à air, servies avec une sauce ketchup à la bière, constituent un apéritif savoureux.",
    ingredients: [
      { product: "ketchup", quantity: "0.75", unit: "cup" },
      { product: "beer", quantity: "0.5", unit: "cup" },
      { product: "worcestershire sauce", quantity: "1", unit: "tablespoon" },
      { product: "baking potatoes", quantity: "2", unit: null },
      { product: "garlic powder", quantity: "0.5", unit: "teaspoon" },
    ],
    directions: [
      "Mélanger le ketchup, la bière, la sauce Worcestershire dans une casserole. Porter à ébullition, puis laisser mijoter 3 à 5 minutes.",
      "Préchauffer la friteuse à 200°C.",
      "Trancher les pommes de terre à 6mm d'épaisseur. Vaporiser d'huile d'olive, saupoudrer d'ail, sel et poivre.",
      "Cuire 14 à 17 minutes en secouant occasionnellement jusqu'à dorure.",
      "Servir avec la sauce ketchup à la bière.",
    ],
  },
  {
    id: 2,
    recipe_title: "Classic Butter Chicken",
    category_fr: "Plats Principaux",
    num_ingredients: 12,
    num_steps: 6,
    description: "Un poulet au beurre classique, crémeux et savoureux, parfait avec du riz basmati.",
    ingredients: [
      { product: "chicken breast", quantity: "2", unit: "pounds" },
      { product: "butter", quantity: "0.25", unit: "cup" },
      { product: "garlic powder", quantity: "1", unit: "teaspoon" },
      { product: "tomato sauce", quantity: "1", unit: "can" },
      { product: "heavy cream", quantity: "0.5", unit: "cup" },
    ],
    directions: [
      "Couper le poulet en morceaux et assaisonner.",
      "Faire fondre le beurre dans une grande poêle à feu moyen.",
      "Faire dorer le poulet 5-6 minutes de chaque côté.",
      "Ajouter la sauce tomate et les épices. Laisser mijoter 15 minutes.",
      "Incorporer la crème fraîche et laisser réduire 5 minutes.",
      "Servir avec du riz basmati et de la coriandre fraîche.",
    ],
  },
  {
    id: 3,
    recipe_title: "Garlic Butter Shrimp Pasta",
    category_fr: "Plats Principaux",
    num_ingredients: 8,
    num_steps: 4,
    description: "Des crevettes sautées à l'ail et au beurre sur des pâtes, prêtes en 20 minutes.",
    ingredients: [
      { product: "shrimp", quantity: "1", unit: "pound" },
      { product: "butter", quantity: "3", unit: "tablespoons" },
      { product: "garlic powder", quantity: "1", unit: "teaspoon" },
      { product: "pasta", quantity: "8", unit: "ounces" },
      { product: "lemon juice", quantity: "2", unit: "tablespoons" },
    ],
    directions: [
      "Cuire les pâtes selon les instructions. Réserver 1 tasse d'eau de cuisson.",
      "Faire fondre le beurre, ajouter l'ail et faire revenir 1 minute.",
      "Ajouter les crevettes, cuire 2 minutes de chaque côté.",
      "Mélanger les pâtes avec les crevettes, ajouter le jus de citron et servir.",
    ],
  },
];

function searchMockRecipes(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return MOCK_RECIPES.filter(
    (r) =>
      r.ingredients.some((i) => i.product.toLowerCase().includes(q)) ||
      r.recipe_title.toLowerCase().includes(q)
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const ChefIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const LeafIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const ArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --cream:    #FAF7F2;
    --warm:     #F5EFE4;
    --brown:    #3D2B1F;
    --rust:     #C4622D;
    --rust2:    #E8845A;
    --green:    #4A7C59;
    --gold:     #D4A843;
    --gray:     #8A7968;
    --white:    #FFFFFF;
    --shadow:   0 4px 24px rgba(61,43,31,0.10);
    --shadow2:  0 2px 8px  rgba(61,43,31,0.08);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--brown);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--cream);
  }

  /* ── HEADER ── */
  .header {
    background: var(--brown);
    padding: 52px 24px 32px;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: -60px; right: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(196,98,45,0.18);
  }
  .header::after {
    content: '';
    position: absolute;
    bottom: -30px; left: 30px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(212,168,67,0.12);
  }
  .header-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
    position: relative;
    z-index: 1;
  }
  .header-icon {
    width: 48px; height: 48px;
    background: var(--rust);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  .header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: var(--white);
    line-height: 1.1;
  }
  .header-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.55);
    margin-left: 60px;
    position: relative;
    z-index: 1;
    letter-spacing: 0.02em;
  }

  /* ── SEARCH BAR ── */
  .search-wrap {
    padding: 0 20px;
    margin-top: -22px;
    position: relative;
    z-index: 10;
  }
  .search-box {
    background: var(--white);
    border-radius: 18px;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    padding: 4px 4px 4px 18px;
    gap: 10px;
    border: 2px solid transparent;
    transition: border-color 0.2s;
  }
  .search-box:focus-within {
    border-color: var(--rust);
  }
  .search-icon { color: var(--gray); flex-shrink: 0; }
  .search-input {
    flex: 1;
    border: none;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    color: var(--brown);
    background: transparent;
    padding: 10px 0;
  }
  .search-input::placeholder { color: var(--gray); }
  .search-clear {
    width: 36px; height: 36px;
    border-radius: 12px;
    background: var(--warm);
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--gray);
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .search-clear:hover { background: #EDE6D8; }
  .search-btn {
    background: var(--rust);
    color: white;
    border: none;
    border-radius: 14px;
    padding: 10px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    flex-shrink: 0;
    letter-spacing: 0.01em;
  }
  .search-btn:active { transform: scale(0.97); background: #b5571f; }

  /* ── SUGGESTIONS RAPIDES ── */
  .quick-wrap {
    padding: 16px 20px 0;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .quick-tag {
    background: var(--white);
    border: 1.5px solid #E8DFD0;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    color: var(--brown);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .quick-tag:hover, .quick-tag.active {
    background: var(--rust);
    border-color: var(--rust);
    color: white;
  }

  /* ── SECTION TITLE ── */
  .section-title {
    padding: 20px 20px 12px;
    font-family: 'Playfair Display', serif;
    font-size: 19px;
    font-weight: 600;
    color: var(--brown);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .section-count {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--gray);
  }

  /* ── RECIPE CARD ── */
  .cards-list { padding: 0 20px 100px; display: flex; flex-direction: column; gap: 16px; }

  .card {
    background: var(--white);
    border-radius: 20px;
    box-shadow: var(--shadow2);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s;
    border: 1.5px solid #F0E8DA;
  }
  .card:active { transform: scale(0.98); box-shadow: var(--shadow); }

  .card-color-bar {
    height: 5px;
    background: linear-gradient(90deg, var(--rust), var(--gold));
  }
  .card-body { padding: 16px 18px 18px; }
  .card-cat {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--rust);
    margin-bottom: 6px;
  }
  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 600;
    color: var(--brown);
    line-height: 1.3;
    margin-bottom: 10px;
  }
  .card-meta {
    display: flex;
    gap: 14px;
    margin-bottom: 12px;
  }
  .card-meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--gray);
  }
  .card-ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .ing-chip {
    background: var(--warm);
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 12px;
    color: var(--brown);
    font-weight: 500;
  }
  .ing-chip.highlight {
    background: rgba(196,98,45,0.12);
    color: var(--rust);
    font-weight: 600;
  }
  .ing-more {
    font-size: 12px;
    color: var(--gray);
    align-self: center;
    padding-left: 2px;
  }

  /* ── EMPTY / LOADING ── */
  .empty {
    padding: 60px 24px;
    text-align: center;
    flex: 1;
  }
  .empty-emoji { font-size: 56px; margin-bottom: 16px; }
  .empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    color: var(--brown);
    margin-bottom: 8px;
  }
  .empty-sub { font-size: 14px; color: var(--gray); line-height: 1.5; }

  .loading {
    padding: 60px 24px;
    text-align: center;
  }
  .spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--warm);
    border-top-color: var(--rust);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── DETAIL VIEW ── */
  .detail { flex: 1; overflow-y: auto; }

  .detail-header {
    background: var(--brown);
    padding: 52px 20px 28px;
    position: relative;
  }
  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.12);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 8px 14px;
    margin-bottom: 20px;
    transition: background 0.15s;
  }
  .back-btn:hover { background: rgba(255,255,255,0.2); }

  .detail-cat {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--rust2);
    margin-bottom: 8px;
  }
  .detail-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: white;
    line-height: 1.25;
    margin-bottom: 14px;
  }
  .detail-meta {
    display: flex;
    gap: 16px;
  }
  .detail-meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: rgba(255,255,255,0.65);
  }

  .detail-body { padding: 24px 20px 80px; }

  .detail-desc {
    font-size: 14px;
    line-height: 1.65;
    color: var(--gray);
    margin-bottom: 28px;
    padding: 16px;
    background: var(--warm);
    border-radius: 14px;
    border-left: 3px solid var(--rust);
  }

  .detail-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--brown);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .detail-section-title span { font-size: 20px; }

  .ing-list { margin-bottom: 28px; display: flex; flex-direction: column; gap: 8px; }
  .ing-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    background: var(--white);
    border-radius: 12px;
    border: 1.5px solid #F0E8DA;
  }
  .ing-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--rust);
    flex-shrink: 0;
  }
  .ing-name { flex: 1; font-size: 14px; font-weight: 500; color: var(--brown); }
  .ing-qty {
    font-size: 13px;
    color: var(--gray);
    font-weight: 400;
    text-align: right;
  }

  .steps-list { display: flex; flex-direction: column; gap: 12px; }
  .step-row {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .step-num {
    width: 32px; height: 32px;
    border-radius: 10px;
    background: var(--rust);
    color: white;
    font-size: 14px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .step-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.6;
    color: var(--brown);
    padding-top: 5px;
  }

  /* ── HOME SCREEN ── */
  .home-banner {
    margin: 20px 20px 0;
    background: linear-gradient(135deg, var(--rust) 0%, var(--gold) 100%);
    border-radius: 20px;
    padding: 20px;
    color: white;
    position: relative;
    overflow: hidden;
  }
  .home-banner::after {
    content: '🍳';
    position: absolute;
    right: 16px; bottom: -4px;
    font-size: 56px;
    opacity: 0.25;
  }
  .home-banner h2 {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    margin-bottom: 4px;
  }
  .home-banner p { font-size: 13px; opacity: 0.85; }
`;

// ─── COMPOSANTS ───────────────────────────────────────────────────────────────

function RecipeCard({ recipe, query, onClick }) {
  const displayIngredients = recipe.ingredients.slice(0, 4);
  const remaining = recipe.num_ingredients - displayIngredients.length;

  return (
    <div className="card" onClick={() => onClick(recipe)}>
      <div className="card-color-bar" />
      <div className="card-body">
        <div className="card-cat">{recipe.category_fr}</div>
        <div className="card-title">{recipe.recipe_title}</div>
        <div className="card-meta">
          <div className="card-meta-item">
            <LeafIcon />
            {recipe.num_ingredients} ingrédients
          </div>
          <div className="card-meta-item">
            <ClockIcon />
            {recipe.num_steps} étapes
          </div>
        </div>
        <div className="card-ingredients">
          {displayIngredients.map((ing, i) => {
            const isMatch = query && ing.product.toLowerCase().includes(query.toLowerCase());
            return (
              <span key={i} className={`ing-chip ${isMatch ? "highlight" : ""}`}>
                {ing.product}
              </span>
            );
          })}
          {remaining > 0 && (
            <span className="ing-more">+{remaining} autres</span>
          )}
        </div>
      </div>
    </div>
  );
}

function RecipeDetail({ recipe, onBack }) {
  return (
    <div className="detail">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft /> Retour
        </button>
        <div className="detail-cat">{recipe.category_fr}</div>
        <div className="detail-title">{recipe.recipe_title}</div>
        <div className="detail-meta">
          <div className="detail-meta-item">
            <LeafIcon />
            {recipe.num_ingredients} ingrédients
          </div>
          <div className="detail-meta-item">
            <ClockIcon />
            {recipe.num_steps} étapes
          </div>
        </div>
      </div>

      <div className="detail-body">
        {recipe.description && (
          <div className="detail-desc">{recipe.description}</div>
        )}

        <div className="detail-section-title">
          <span>🥕</span> Ingrédients
        </div>
        <div className="ing-list">
          {recipe.ingredients.map((ing, i) => (
            <div className="ing-row" key={i}>
              <div className="ing-dot" />
              <div className="ing-name">{ing.product}</div>
              <div className="ing-qty">
                {ing.quantity && `${ing.quantity} `}{ing.unit || ""}
              </div>
            </div>
          ))}
        </div>

        <div className="detail-section-title">
          <span>📝</span> Préparation
        </div>
        <div className="steps-list">
          {recipe.directions.map((step, i) => (
            <div className="step-row" key={i}>
              <div className="step-num">{i + 1}</div>
              <div className="step-text">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery]           = useState("");
  const [inputVal, setInputVal]     = useState("");
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [selected, setSelected]     = useState(null);

  const QUICK_TAGS = ["butter", "chicken", "garlic", "potato", "tomato", "eggs"];

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setQuery(q);

    try {
      // Essayer l'API backend
      const res = await fetch(`${API_BASE}/api/recipes/search?product=${encodeURIComponent(q)}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        throw new Error("API non disponible");
      }
    } catch {
      // Fallback sur les données mock
      await new Promise(r => setTimeout(r, 400)); // simulation délai
      setResults(searchMockRecipes(q));
    }
    setLoading(false);
  }, []);

  const handleSearch = () => doSearch(inputVal);

  const handleTag = (tag) => {
    setInputVal(tag);
    doSearch(tag);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setInputVal("");
    setResults([]);
    setSearched(false);
    setQuery("");
  };

  if (selected) {
    return (
      <>
        <style>{styles}</style>
        <div className="app">
          <RecipeDetail recipe={selected} onBack={() => setSelected(null)} />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* HEADER */}
        <div className="header">
          <div className="header-top">
            <div className="header-icon"><ChefIcon /></div>
            <h1>Mes Recettes</h1>
          </div>
          <div className="header-sub">Recherche par ingrédient</div>
        </div>

        {/* SEARCH */}
        <div className="search-wrap">
          <div className="search-box">
            <div className="search-icon"><SearchIcon /></div>
            <input
              className="search-input"
              placeholder="Ex: butter, chicken, garlic..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {inputVal && (
              <button className="search-clear" onClick={handleClear}>
                <XIcon />
              </button>
            )}
            <button className="search-btn" onClick={handleSearch}>
              Chercher
            </button>
          </div>
        </div>

        {/* QUICK TAGS */}
        <div className="quick-wrap">
          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              className={`quick-tag ${query === tag ? "active" : ""}`}
              onClick={() => handleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* CONTENU */}
        {!searched && (
          <div className="home-banner">
            <h2>Que cuisiner ce soir ?</h2>
            <p>Tapez un ingrédient pour découvrir des recettes</p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p style={{ color: "var(--gray)", fontSize: 14 }}>Recherche en cours...</p>
          </div>
        )}

        {!loading && searched && (
          <>
            <div className="section-title">
              {results.length > 0 ? "Recettes trouvées" : "Aucun résultat"}
              <span className="section-count">
                {results.length > 0 ? `${results.length} recette${results.length > 1 ? "s" : ""}` : ""}
              </span>
            </div>

            {results.length === 0 ? (
              <div className="empty">
                <div className="empty-emoji">🥦</div>
                <div className="empty-title">Aucune recette trouvée</div>
                <div className="empty-sub">
                  Essayez avec un autre ingrédient,<br />comme "butter", "chicken" ou "garlic".
                </div>
              </div>
            ) : (
              <div className="cards-list">
                {results.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    query={query}
                    onClick={setSelected}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
