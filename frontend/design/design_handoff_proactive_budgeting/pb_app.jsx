
// ─── pb_app.jsx ───────────────────────────────────────────────────
// App shell: navigation state, data management, bottom nav

const { useState, useCallback } = React;

// ── Seed data ─────────────────────────────────────────────────────
const SEED = {
  user: { name: 'Lilla', income: 450000, currency: 'HUF' },
  budgetRules: [
    { id: 'needs',   label: 'Szükségletek', percentage: 60, icon: '🏠', isSavings: false },
    { id: 'wants',   label: 'Vágyak',        percentage: 20, icon: '✨', isSavings: false },
    { id: 'savings', label: 'Megtakarítás',  percentage: 20, icon: '🎯', isSavings: true  },
  ],
  transactions: [
    { id: 1,  categoryId: 'needs',   amount: 85000, description: 'Bérleti díj',      date: '2026-04-01' },
    { id: 2,  categoryId: 'needs',   amount: 12500, description: 'Villany',           date: '2026-04-03' },
    { id: 3,  categoryId: 'needs',   amount: 8200,  description: 'Internet',          date: '2026-04-05' },
    { id: 4,  categoryId: 'needs',   amount: 24300, description: 'Élelmiszer',        date: '2026-04-08' },
    { id: 5,  categoryId: 'needs',   amount: 18700, description: 'Élelmiszer',        date: '2026-04-14' },
    { id: 6,  categoryId: 'needs',   amount: 9800,  description: 'Élelmiszer',        date: '2026-04-20' },
    { id: 7,  categoryId: 'wants',   amount: 15000, description: 'Étterem',           date: '2026-04-06' },
    { id: 8,  categoryId: 'wants',   amount: 8500,  description: 'Mozi',              date: '2026-04-10' },
    { id: 9,  categoryId: 'wants',   amount: 22000, description: 'Ruházat',           date: '2026-04-13' },
    { id: 10, categoryId: 'wants',   amount: 19500, description: 'Étterem',           date: '2026-04-18' },
    { id: 11, categoryId: 'wants',   amount: 12000, description: 'Sport',             date: '2026-04-21' },
    { id: 12, categoryId: 'savings', amount: 45000, description: 'Megtakarítás átutalás', date: '2026-04-02' },
  ],
  events: [
    { id: 1, name: 'Nyaralás – Görögország', estimatedCost: 85000, date: '2026-05-15' },
    { id: 2, name: 'Születésnapi buli',       estimatedCost: 15000, date: '2026-05-08' },
    { id: 3, name: 'Évfordulós vacsora',      estimatedCost: 22000, date: '2026-05-02' },
  ],
  alerts: [
    {
      id: 1,
      type: 'BREACH_PREDICTED',
      categoryId: 'wants',
      message: 'Vágyak kategória 26%-kal gyorsabb ütemben fogyott a tervezettnél. Várható havi végösszeg: 101 100 Ft — ez 11 100 Ft-tal meghaladná a 90 000 Ft-os keretedet.',
      isRead: false,
    },
  ],
  savingsGoals: [
    { id: 1, label: 'Nyaralási alap', current: 45000, target: 200000 },
  ],
};

// ── Nav icons ─────────────────────────────────────────────────────
function IconHome({ active }) {
  const c = active ? 'var(--c-brand)' : 'var(--c-muted)';
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 9.5L11 3L19 9.5V19H14V14H8V19H3V9.5Z"
        stroke={c} strokeWidth="1.7" strokeLinejoin="round"
        fill={active ? 'var(--c-brand-dim)' : 'none'} />
    </svg>
  );
}
function IconCalendar({ active }) {
  const c = active ? 'var(--c-brand)' : 'var(--c-muted)';
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="5" width="16" height="15" rx="3" stroke={c} strokeWidth="1.7"
        fill={active ? 'var(--c-brand-dim)' : 'none'} />
      <path d="M7 3V7M15 3V7M3 10H19" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
      <circle cx="7.5" cy="14" r="1" fill={c} />
      <circle cx="11" cy="14" r="1" fill={c} />
      <circle cx="14.5" cy="14" r="1" fill={c} />
    </svg>
  );
}
function IconSettings({ active }) {
  const c = active ? 'var(--c-brand)' : 'var(--c-muted)';
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="3" stroke={c} strokeWidth="1.7" />
      <path d="M11 2V4M11 18V20M2 11H4M18 11H20M4.22 4.22L5.64 5.64M16.36 16.36L17.78 17.78M4.22 17.78L5.64 16.36M16.36 5.64L17.78 4.22"
        stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 4V18M4 11H18" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// ── Add Transaction Sheet ─────────────────────────────────────────
function AddTransactionSheet({ appData, onClose, onAdd }) {
  const { budgetRules } = appData;
  const [amount, setAmount] = useState(0);
  const [catId, setCatId] = useState(budgetRules[0]?.id);
  const [desc, setDesc] = useState('');

  function submit() {
    if (!amount || !catId) return;
    onAdd({
      id: Date.now(),
      categoryId: catId,
      amount,
      description: desc || 'Névtelen tranzakció',
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  }

  return (
    <div className="overlay anim-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bottom-sheet anim-slide-up">
        <div className="sheet-handle"><div /></div>
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <p className="sheet-title" style={{ padding: 0 }}>Kiadás rögzítése</p>
        </div>

        {/* Amount numpad */}
        <AmountNumpad value={amount} onChange={setAmount} />

        {/* Category + description */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-muted)', marginBottom: 8 }}>Kategória</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {budgetRules.map(cat => (
                <button key={cat.id} onClick={() => setCatId(cat.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px', borderRadius: 'var(--r-full)',
                  border: `2px solid ${catId === cat.id ? 'var(--c-brand)' : 'var(--c-border)'}`,
                  background: catId === cat.id ? 'var(--c-brand-light)' : 'var(--c-surface-2)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  color: catId === cat.id ? 'var(--c-brand)' : 'var(--c-muted)',
                  transition: 'all 0.15s', WebkitTapHighlightColor: 'transparent',
                }}>
                  <span style={{ fontSize: 16 }}>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Megjegyzés (opcionális)"
            value={desc}
            onChange={setDesc}
            placeholder="pl. Lidl, Étterem, Benzin…"
          />
          <Btn size="full" onClick={submit} disabled={amount === 0}>
            Rögzítés — {amount > 0 ? fmtHUF(amount) : '0 Ft'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
function App() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('pb_state') || 'null'); } catch { return null; } })();
  const init = saved || SEED;

  const [hasOnboarded, setHasOnboarded] = useState(!!saved);
  const [appData, setAppData] = useState(init);
  const [tab, setTab] = useState('dashboard');
  const [navStack, setNavStack] = useState([]);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  function persist(data) {
    try { localStorage.setItem('pb_state', JSON.stringify(data)); } catch {}
  }

  function updateData(patch) {
    setAppData(prev => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }

  function handleOnboardingComplete({ name, income, rules, savingsGoal }) {
    const data = {
      user: { name, income, currency: 'HUF' },
      budgetRules: rules.map(r => ({ id: r.id, label: r.label, percentage: r.pct, icon: r.icon, isSavings: r.id === 'savings' })),
      transactions: [],
      events: [],
      alerts: [],
      savingsGoals: savingsGoal ? [{ id: 1, label: savingsGoal.label, current: 0, target: savingsGoal.target }] : [],
    };
    setAppData(data);
    persist(data);
    setHasOnboarded(true);
  }

  function handleDismissAlert(id) {
    updateData({ alerts: appData.alerts.map(a => a.id === id ? { ...a, isRead: true } : a) });
  }

  function handleAddTransaction(tx) {
    updateData({ transactions: [...appData.transactions, tx] });
  }

  function handleAddEvent(ev) {
    updateData({ events: [...appData.events, { ...ev, id: Date.now() }] });
  }

  function handleBudgetUpdate({ income, rules }) {
    updateData({
      user: { ...appData.user, income },
      budgetRules: rules,
    });
  }

  function handleNavigate(dest, param) {
    setNavStack(s => [...s, { screen: dest, param }]);
  }

  function handleBack() {
    setNavStack(s => s.slice(0, -1));
  }

  // Resolve current screen
  const topNav = navStack[navStack.length - 1];
  const currentTab = topNav ? topNav.screen : tab;

  function renderScreen() {
    if (topNav?.screen === 'category') {
      return <CategoryDetail categoryId={topNav.param} appData={appData} onBack={handleBack} />;
    }
    if (topNav?.screen === 'budget') {
      return <BudgetSettings appData={appData} onBack={handleBack} onUpdate={handleBudgetUpdate} />;
    }
    switch (tab) {
      case 'dashboard':
        return <Dashboard appData={appData} onNavigate={handleNavigate} onDismissAlert={handleDismissAlert} onAddTransaction={() => setShowAddTx(true)} />;
      case 'events':
        return <EventsScreen appData={appData} onNavigate={handleNavigate} onAddEvent={() => setShowAddEvent(true)} />;
      case 'settings':
        return <BudgetSettings appData={appData} onBack={() => {}} onUpdate={handleBudgetUpdate} />;
      default:
        return null;
    }
  }

  if (!hasOnboarded) {
    return (
      <div className="phone-shell">
        <div className="status-bar">
          <span className="time">9:41</span>
          <div className="status-icons">
            <svg width="17" height="12" viewBox="0 0 17 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="4.5" y="2" width="3" height="10" rx="1" fill="currentColor"/><rect x="9" y="0" width="3" height="12" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.3"/></svg>
            <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2C5.2 2 2.7 3.2 1 5.1L2.4 6.5C3.8 4.9 5.8 4 8 4C10.2 4 12.2 4.9 13.6 6.5L15 5.1C13.3 3.2 10.8 2 8 2Z" fill="currentColor"/><path d="M8 6C6.3 6 4.8 6.7 3.7 7.8L5.1 9.2C5.9 8.5 6.9 8 8 8C9.1 8 10.1 8.5 10.9 9.2L12.3 7.8C11.2 6.7 9.7 6 8 6Z" fill="currentColor"/><circle cx="8" cy="11" r="1.5" fill="currentColor"/></svg>
            <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><path d="M23 4V8C23.8 7.5 24.5 6.8 24.5 6C24.5 5.2 23.8 4.5 23 4Z" fill="currentColor" opacity="0.4"/></svg>
          </div>
        </div>
        <div className="screen-area">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
        <div className="home-indicator"><div /></div>
      </div>
    );
  }

  return (
    <div className="phone-shell">
      {/* Status bar */}
      <div className="status-bar">
        <span className="time">9:41</span>
        <div className="status-icons">
          <svg width="17" height="12" viewBox="0 0 17 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="4.5" y="2" width="3" height="10" rx="1" fill="currentColor"/><rect x="9" y="0" width="3" height="12" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.3"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2C5.2 2 2.7 3.2 1 5.1L2.4 6.5C3.8 4.9 5.8 4 8 4C10.2 4 12.2 4.9 13.6 6.5L15 5.1C13.3 3.2 10.8 2 8 2Z" fill="currentColor"/><path d="M8 6C6.3 6 4.8 6.7 3.7 7.8L5.1 9.2C5.9 8.5 6.9 8 8 8C9.1 8 10.1 8.5 10.9 9.2L12.3 7.8C11.2 6.7 9.7 6 8 6Z" fill="currentColor"/><circle cx="8" cy="11" r="1.5" fill="currentColor"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><path d="M23 4V8C23.8 7.5 24.5 6.8 24.5 6C24.5 5.2 23.8 4.5 23 4Z" fill="currentColor" opacity="0.4"/></svg>
        </div>
      </div>

      {/* Screen */}
      <div className="screen-area">
        {renderScreen()}

        {/* Bottom nav — hidden when sub-screen is open */}
        {!topNav && (
          <div className="bottom-nav">
            <button className={`nav-tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => { setTab('dashboard'); setNavStack([]); }}>
              <IconHome active={tab === 'dashboard'} />
              <span>Főoldal</span>
            </button>
            <button className={`nav-tab ${tab === 'events' ? 'active' : ''}`} onClick={() => { setTab('events'); setNavStack([]); }}>
              <IconCalendar active={tab === 'events'} />
              <span>Események</span>
            </button>
            <div className="nav-fab">
              <button onClick={() => setShowAddTx(true)}><IconPlus /></button>
            </div>
            <button className={`nav-tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => { setTab('settings'); setNavStack([]); }}>
              <IconSettings active={tab === 'settings'} />
              <span>Büdzsé</span>
            </button>
            <button className="nav-tab" onClick={() => { persist(null); localStorage.removeItem('pb_state'); setHasOnboarded(false); setAppData(SEED); }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.5" stroke="var(--c-muted)" strokeWidth="1.7"/><path d="M4 19C4 15.686 7.134 13 11 13C14.866 13 18 15.686 18 19" stroke="var(--c-muted)" strokeWidth="1.7" strokeLinecap="round"/></svg>
              <span>Profil</span>
            </button>
          </div>
        )}

        {/* Overlays */}
        {showAddTx && (
          <AddTransactionSheet
            appData={appData}
            onClose={() => setShowAddTx(false)}
            onAdd={handleAddTransaction}
          />
        )}
        {showAddEvent && (
          <AddEventSheet
            onClose={() => setShowAddEvent(false)}
            onAdd={handleAddEvent}
          />
        )}
      </div>

      <div className="home-indicator"><div /></div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
