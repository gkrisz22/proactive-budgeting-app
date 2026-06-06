
// ─── pb_screens.jsx ──────────────────────────────────────────────
// All app screens: Onboarding, Dashboard, CategoryDetail, Events, Budget

const { useState, useEffect, useRef } = React;

// ── Onboarding ────────────────────────────────────────────────────
function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [preset, setPreset] = useState('6020');
  const [goalName, setGoalName] = useState('Nyaralás');
  const [goalTarget, setGoalTarget] = useState('');

  const presets = {
    '6020': { label: '60 / 20 / 20', desc: 'Szükségletek / Vágyak / Megtakarítás', rules: [{id:'needs',label:'Szükségletek',pct:60,icon:'🏠'},{id:'wants',label:'Vágyak',pct:20,icon:'✨'},{id:'savings',label:'Megtakarítás',pct:20,icon:'🎯'}] },
    '5030': { label: '50 / 30 / 20', desc: 'Szükségletek / Vágyak / Megtakarítás', rules: [{id:'needs',label:'Szükségletek',pct:50,icon:'🏠'},{id:'wants',label:'Vágyak',pct:30,icon:'✨'},{id:'savings',label:'Megtakarítás',pct:20,icon:'🎯'}] },
    'custom': { label: 'Saját felosztás', desc: 'Személyre szabott kategóriák' },
  };

  function finish(skip = false) {
    const inc = parseInt(income) || 450000;
    const p = presets[preset];
    onComplete({
      name: name || 'Felhasználó',
      income: inc,
      rules: p.rules || presets['6020'].rules,
      savingsGoal: skip ? null : { label: goalName || 'Megtakarítás', target: parseInt(goalTarget) || 90000 },
    });
  }

  const steps = [
    // Step 0: Welcome
    <div key={0} className="anim-fade-in" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--c-brand)', marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M6 18C6 11.373 11.373 6 18 6C24.627 6 30 11.373 30 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M18 12V18L22 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="18" cy="28" r="2" fill="white"/>
            <path d="M13 28H23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.1 }}>
          Üdvözöl a<br/>Proaktív Büdzsé
        </h1>
        <p style={{ fontSize: 16, color: 'var(--c-muted)', lineHeight: 1.6 }}>
          Ne csak utólag nézd, hova ment a pénzed — előre figyelmeztetünk, mielőtt túllépnéd a keretedet.
        </p>
        <Spacer h={24} />
        <Input label="Mi a neved?" value={name} onChange={setName} placeholder="pl. Lilla" />
      </div>
      <Btn size="full" onClick={() => setStep(1)} disabled={!name.trim()}>
        Kezdjük el →
      </Btn>
    </div>,

    // Step 1: Income
    <div key={1} className="anim-slide-right" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <BackBtn onBack={() => setStep(0)} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-muted)', letterSpacing: '0.5px', marginBottom: 8 }}>2 / 4</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Havi bevételed</h2>
        <p style={{ fontSize: 15, color: 'var(--c-muted)', marginBottom: 28, lineHeight: 1.5 }}>
          Ebből számítjuk a napi keretedet és a kategória limiteket.
        </p>
        <Input
          label="Nettó havi jövedelem"
          value={income}
          onChange={setIncome}
          placeholder="450 000"
          type="number"
          suffix="Ft"
        />
        {income && (
          <div style={{
            marginTop: 16, padding: '12px 14px', background: 'var(--c-brand-light)',
            borderRadius: 'var(--r-md)',
          }}>
            <p style={{ fontSize: 13, color: 'var(--c-brand)', fontWeight: 500 }}>
              Napi büdzsé: <strong>{fmtHUF(Math.round(parseInt(income) / 30))}</strong>
            </p>
          </div>
        )}
      </div>
      <Btn size="full" onClick={() => setStep(2)} disabled={!income}>Tovább →</Btn>
    </div>,

    // Step 2: Budget preset
    <div key={2} className="anim-slide-right" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      <BackBtn onBack={() => setStep(1)} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-muted)', letterSpacing: '0.5px', marginBottom: 8 }}>3 / 4</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Büdzsé sablon</h2>
        <p style={{ fontSize: 15, color: 'var(--c-muted)', marginBottom: 20 }}>Válassz egy alap felosztást.</p>
        {Object.entries(presets).map(([key, p]) => (
          <div key={key} onClick={() => setPreset(key)} className="pressable" style={{
            padding: '14px 16px', borderRadius: 'var(--r-lg)', marginBottom: 10,
            border: `2px solid ${preset === key ? 'var(--c-brand)' : 'var(--c-border)'}`,
            background: preset === key ? 'var(--c-brand-light)' : 'var(--c-surface)',
            transition: 'border-color 0.15s, background 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px', color: preset===key ? 'var(--c-brand)' : 'var(--c-text)' }}>{p.label}</p>
                <p style={{ fontSize: 12, color: 'var(--c-muted)', marginTop: 2 }}>{p.desc}</p>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${preset === key ? 'var(--c-brand)' : 'var(--c-border)'}`,
                background: preset === key ? 'var(--c-brand)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {preset === key && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
            {preset === key && p.rules && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {p.rules.map(r => (
                  <div key={r.id} style={{ flex: 1, textAlign: 'center', background: 'white', borderRadius: 8, padding: '6px 4px' }}>
                    <p style={{ fontSize: 18, marginBottom: 2 }}>{r.icon}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-brand)' }}>{r.pct}%</p>
                    <p style={{ fontSize: 10, color: 'var(--c-muted)', lineHeight: 1.2 }}>{r.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Btn size="full" onClick={() => setStep(3)}>Tovább →</Btn>
    </div>,

    // Step 3: Savings goal (optional)
    <div key={3} className="anim-slide-right" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      <BackBtn onBack={() => setStep(2)} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-muted)', letterSpacing: '0.5px', marginBottom: 8 }}>4 / 4</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Megtakarítási cél</h2>
        <p style={{ fontSize: 15, color: 'var(--c-muted)', marginBottom: 24, lineHeight: 1.5 }}>
          Mire spórolsz? Opciónaként kihagyható.
        </p>
        <Input label="Cél neve" value={goalName} onChange={setGoalName} placeholder="pl. Nyaralás, iPhone, Lakás" />
        <Spacer h={14} />
        <Input label="Célösszeg" value={goalTarget} onChange={setGoalTarget} type="number" placeholder="200 000" suffix="Ft" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn size="md" variant="ghost" onClick={() => finish(true)} style={{ flex: 1 }}>Kihagyom</Btn>
        <Btn size="md" onClick={() => finish(false)} style={{ flex: 2 }}>Kezdjük →</Btn>
      </div>
    </div>,
  ];

  return (
    <div style={{ height: '100%', overflow: 'hidden', background: 'var(--c-surface)' }}>
      {steps[step]}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
function Dashboard({ appData, onNavigate, onDismissAlert, onAddTransaction }) {
  const { user, budgetRules, transactions, alerts, savingsGoals, events } = appData;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = daysInMonth - daysElapsed + 1;

  const monthTx = transactions.filter(t => isThisMonth(t.date));
  const totalSpent = monthTx.reduce((s, t) => s + t.amount, 0);
  const upcomingEventCosts = events
    .filter(e => isThisMonth(e.date))
    .reduce((s, e) => s + e.estimatedCost, 0);
  const remainingBudget = user.income - totalSpent - upcomingEventCosts;
  const safeToSpend = remainingBudget / daysRemaining;
  const dailyBudget = user.income / daysInMonth;

  const unreadAlerts = alerts.filter(a => !a.isRead);

  function spentForCat(catId) {
    return monthTx.filter(t => t.categoryId === catId).reduce((s, t) => s + t.amount, 0);
  }

  return (
    <div className="scroll-view" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--c-muted)' }}>Szia, {user.name} 👋</p>
          <p style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.5px' }}>
            {now.toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--c-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Safe-to-spend hero */}
        <SafeToSpendHero amount={safeToSpend} dailyBudget={dailyBudget} />

        {/* Alerts */}
        {unreadAlerts.map(a => (
          <AlertBanner
            key={a.id}
            alert={a}
            categories={budgetRules}
            onDismiss={() => onDismissAlert(a.id)}
          />
        ))}

        {/* Budget overview */}
        <div>
          <SectionHeader title="Kategóriák" action="Részletek" onAction={() => onNavigate('budget')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {budgetRules.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                spent={spentForCat(cat.id)}
                income={user.income}
                daysElapsed={daysElapsed}
                daysInMonth={daysInMonth}
                onClick={() => onNavigate('category', cat.id)}
              />
            ))}
          </div>
        </div>

        {/* Savings goals */}
        {savingsGoals.length > 0 && (
          <div>
            <SectionHeader title="Megtakarítás" />
            {savingsGoals.map(g => (
              <SavingsGoalCard key={g.id} goal={g} />
            ))}
          </div>
        )}

        {/* Income summary */}
        <Card padding="14px 16px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 2 }}>Havi bevétel</p>
              <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.8px' }}>{fmtHUF(user.income)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 2 }}>Elköltve</p>
              <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.8px', color: 'var(--c-muted)' }}>
                {fmtHUF(totalSpent)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 2 }}>Maradék</p>
              <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.8px', color: 'var(--c-safe)' }}>
                {fmtHUF(user.income - totalSpent)}
              </p>
            </div>
          </div>
          <Spacer h={10} />
          <ProgressBar value={totalSpent} max={user.income} tone={totalSpent/user.income > 0.85 ? 'danger' : totalSpent/user.income > 0.65 ? 'warn' : 'brand'} height={6} />
          <p style={{ fontSize: 11, color: 'var(--c-muted)', marginTop: 5, textAlign: 'right' }}>
            {((totalSpent/user.income)*100).toFixed(0)}% elköltve · {daysElapsed}/{daysInMonth}. nap
          </p>
        </Card>
      </div>
    </div>
  );
}

// ── Category Detail ───────────────────────────────────────────────
function CategoryDetail({ categoryId, appData, onBack }) {
  const { user, budgetRules, transactions } = appData;
  const cat = budgetRules.find(c => c.id === categoryId);
  if (!cat) return null;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const limit = (cat.percentage / 100) * user.income;
  const monthTx = transactions.filter(t => t.categoryId === categoryId && isThisMonth(t.date));
  const spent = monthTx.reduce((s, t) => s + t.amount, 0);
  const info = paceInfo(spent, limit, daysElapsed, daysInMonth);

  return (
    <div className="scroll-view anim-slide-right" style={{ paddingBottom: 80 }}>
      <div style={{ padding: '8px 20px 16px' }}>
        <BackBtn onBack={onBack} />
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, fontSize: 24,
              background: `var(--c-${info.tone}-light)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {cat.icon}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>{cat.label}</h2>
              <p style={{ fontSize: 13, color: 'var(--c-muted)' }}>{cat.percentage}% · {fmtHUF(limit)} / hó</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 2 }}>Elköltve</p>
              <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-1px', color: `var(--c-${info.tone})` }}>
                {fmtHUF(spent)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 2 }}>Várható havi</p>
              <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-1px' }}>
                {fmtHUF(Math.round(info.projected))}
              </p>
            </div>
          </div>
          <ProgressBar value={spent} max={limit} tone={info.tone} height={8} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Badge tone={info.tone}>{info.label}</Badge>
            <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>
              Maradék: {fmtHUF(Math.max(0, limit - spent))}
            </span>
          </div>
        </Card>

        {/* Transactions */}
        <div>
          <SectionHeader title={`Tranzakciók (${monthTx.length})`} />
          {monthTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--c-muted)' }}>
              <p style={{ fontSize: 15 }}>Nincs tranzakció ebben a hónapban</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--c-border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              {[...monthTx].sort((a,b) => new Date(b.date) - new Date(a.date)).map((tx, i) => (
                <div key={tx.id} style={{
                  background: 'var(--c-surface)', padding: '13px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500 }}>{tx.description}</p>
                    <p style={{ fontSize: 12, color: 'var(--c-muted)' }}>{fmtDate(tx.date)}</p>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-danger)', letterSpacing: '-0.5px' }}>
                    −{fmtHUF(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Events Screen ─────────────────────────────────────────────────
function EventsScreen({ appData, onNavigate, onAddEvent }) {
  const { events } = appData;
  const sorted = [...events].sort((a,b) => new Date(a.date) - new Date(b.date));
  const upcoming = sorted.filter(e => daysUntil(e.date) >= 0);
  const totalUpcomingCost = upcoming.reduce((s,e) => s + e.estimatedCost, 0);

  return (
    <div className="scroll-view" style={{ paddingBottom: 80 }}>
      <div style={{ padding: '8px 20px 16px' }}>
        <p style={{ fontSize: 13, color: 'var(--c-muted)' }}>Közelgő kiadások</p>
        <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.8px' }}>Események</p>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Summary */}
        <Card padding="14px 16px">
          <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 4 }}>Tervezett kiadások összesen</p>
          <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', color: 'var(--c-brand)' }}>
            {fmtHUF(totalUpcomingCost)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--c-muted)', marginTop: 2 }}>{upcoming.length} közelgő esemény</p>
        </Card>

        {/* Events list */}
        <div>
          <SectionHeader title="Közelgő" action="+ Hozzáadás" onAction={onAddEvent} />
          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontSize: 15, color: 'var(--c-muted)' }}>Nincs tervezett esemény</p>
              <Spacer h={12} />
              <Btn size="sm" variant="secondary" onClick={onAddEvent}>Esemény hozzáadása</Btn>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Budget Settings ───────────────────────────────────────────────
function BudgetSettings({ appData, onBack, onUpdate }) {
  const { user, budgetRules } = appData;
  const [income, setIncome] = useState(String(user.income));
  const [rules, setRules] = useState(budgetRules.map(r => ({ ...r, pctStr: String(r.percentage) })));
  const total = rules.reduce((s, r) => s + (parseInt(r.pctStr) || 0), 0);
  const valid = total === 100;

  function updatePct(id, val) {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, pctStr: val } : rule));
  }

  function save() {
    if (!valid) return;
    onUpdate({
      income: parseInt(income) || user.income,
      rules: rules.map(r => ({ ...r, percentage: parseInt(r.pctStr) })),
    });
    onBack();
  }

  return (
    <div className="scroll-view anim-slide-right" style={{ paddingBottom: 80 }}>
      <div style={{ padding: '8px 20px 16px' }}>
        <BackBtn onBack={onBack} />
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.6px' }}>Büdzsé beállítások</h2>
          <p style={{ fontSize: 14, color: 'var(--c-muted)', marginTop: 4 }}>Szabd személyre a kategóriákat és arányokat.</p>
        </div>

        <Input label="Havi nettó jövedelem" value={income} onChange={setIncome} type="number" suffix="Ft" />

        <div>
          <SectionHeader title="Kategória arányok" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rules.map(r => (
              <Card key={r.id} padding="12px 14px">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22, width: 32 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{r.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--c-muted)' }}>
                      {fmtHUF(Math.round(((parseInt(r.pctStr)||0)/100) * (parseInt(income)||user.income)))} / hó
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number" value={r.pctStr} onChange={e => updatePct(r.id, e.target.value)}
                      min="0" max="100"
                      style={{
                        width: 52, height: 40, textAlign: 'center',
                        border: `2px solid ${valid ? 'var(--c-border)' : 'var(--c-danger)'}`,
                        borderRadius: 8, fontSize: 16, fontWeight: 700,
                        fontFamily: 'inherit', background: 'var(--c-surface-2)',
                        outline: 'none', color: 'var(--c-text)',
                      }}
                    />
                    <span style={{ fontSize: 15, color: 'var(--c-muted)' }}>%</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 'var(--r-md)',
            background: valid ? 'var(--c-safe-light)' : 'var(--c-danger-light)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: valid ? 'var(--c-safe)' : 'var(--c-danger)' }}>
              {valid ? '✓ Összeg: 100%' : `Összeg: ${total}% (${total > 100 ? '+' : ''}${total-100}%)`}
            </span>
          </div>
        </div>

        <Btn size="full" onClick={save} disabled={!valid}>Mentés</Btn>
      </div>
    </div>
  );
}

// ── Add Event Sheet ───────────────────────────────────────────────
function AddEventSheet({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');

  function submit() {
    if (!name || !cost || !date) return;
    onAdd({ name, estimatedCost: parseInt(cost), date });
    onClose();
  }

  return (
    <div className="overlay anim-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bottom-sheet anim-slide-up" style={{ padding: '0 20px 32px' }}>
        <div className="sheet-handle"><div /></div>
        <p className="sheet-title">Esemény hozzáadása</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Esemény neve" value={name} onChange={setName} placeholder="pl. Nyaralás, Születésnap" />
          <Input label="Becsült költség" value={cost} onChange={setCost} type="number" suffix="Ft" placeholder="50 000" />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-muted)', marginBottom: 6 }}>Dátum</p>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%', height: 52, padding: '0 16px',
                background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)',
                borderRadius: 'var(--r-md)', fontSize: 15, fontFamily: 'inherit',
                color: 'var(--c-text)', outline: 'none',
              }}
            />
          </div>
          <Btn size="full" onClick={submit} disabled={!name || !cost || !date}>Hozzáadás</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  OnboardingFlow, Dashboard, CategoryDetail,
  EventsScreen, BudgetSettings, AddEventSheet,
});
