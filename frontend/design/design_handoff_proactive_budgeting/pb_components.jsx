
// ─── pb_components.jsx ───────────────────────────────────────────
// Complex UI components: cards, sheets, spinner, alert banner, etc.

const { useState, useEffect, useRef, useCallback } = React;

// ── Formatting helpers ────────────────────────────────────────────
function fmtHUF(n) {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(n);
}
function fmtShort(n) {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n/1000)}e`;
  return String(n);
}
function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
}
function daysUntil(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d - now) / 86400000);
}
function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ── Pace tone helper ──────────────────────────────────────────────
function paceInfo(spent, limit, daysElapsed, daysInMonth) {
  const rate = spent / daysElapsed;
  const projected = rate * daysInMonth;
  const pctSpent = spent / limit;
  const pctElapsed = daysElapsed / daysInMonth;
  const paceRatio = pctSpent / pctElapsed; // >1 = ahead of pace
  let tone, label;
  if (projected > limit * 1.05) { tone = 'danger'; label = 'Várható túllépés'; }
  else if (paceRatio > 1.15)    { tone = 'warn';   label = 'Gyors ütem'; }
  else                           { tone = 'safe';   label = 'Rendben'; }
  return { tone, label, projected, paceRatio };
}

// ── Card ──────────────────────────────────────────────────────────
function Card({ children, style: s, onClick, padding = 16 }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? 'pressable' : ''}
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--c-border)',
        padding,
        ...s,
      }}
    >
      {children}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────
function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {title}
      </span>
      {action && (
        <button onClick={onAction} style={{
          fontSize: 13, fontWeight: 600, color: 'var(--c-brand)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
        }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ── Safe-to-Spend Hero ────────────────────────────────────────────
function SafeToSpendHero({ amount, dailyBudget }) {
  const pct = amount / dailyBudget;
  const tone = pct >= 0.8 ? 'safe' : pct >= 0.5 ? 'warn' : 'danger';
  const colors = { safe: 'var(--c-safe)', warn: 'var(--c-warn)', danger: 'var(--c-danger)' };
  const bgs = { safe: 'var(--c-safe-light)', warn: 'var(--c-warn-light)', danger: 'var(--c-danger-light)' };
  const labels = { safe: 'Rendben haladunk', warn: 'Figyelj a kiadásokra', danger: 'Keretek veszélyben' };
  return (
    <div style={{
      background: bgs[tone],
      borderRadius: 'var(--r-xl)',
      padding: '24px 20px 20px',
      textAlign: 'center',
      border: `1px solid ${colors[tone]}22`,
    }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: colors[tone], marginBottom: 4, letterSpacing: '0.3px' }}>
        MA BIZTONSÁGOSAN ELKÖLTHETŐ
      </p>
      <p style={{
        fontSize: 44, fontWeight: 700, color: colors[tone],
        letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 6,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {fmtHUF(Math.round(amount))}
      </p>
      <Badge tone={tone}>{labels[tone]}</Badge>
    </div>
  );
}

// ── Alert Banner ──────────────────────────────────────────────────
function AlertBanner({ alert, categories, onDismiss }) {
  const cat = categories.find(c => c.id === alert.categoryId);
  const isBreached = alert.type === 'BREACH_PREDICTED';
  return (
    <div style={{
      background: isBreached ? 'var(--c-danger-light)' : 'var(--c-warn-light)',
      borderRadius: 'var(--r-md)',
      padding: '12px 14px',
      border: `1px solid ${isBreached ? 'var(--c-danger)' : 'var(--c-warn)'}33`,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: isBreached ? 'var(--c-danger)' : 'var(--c-warn)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2.5L13.5 12.5H2.5L8 2.5Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M8 6.5V9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8" cy="11" r="0.75" fill="white"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 600,
          color: isBreached ? 'var(--c-danger)' : 'var(--c-warn)',
          marginBottom: 2,
        }}>
          {isBreached ? 'Várható keretsértés' : 'Gyors költési ütem'} · {cat?.label}
        </p>
        <p style={{ fontSize: 12, color: 'var(--c-text)', opacity: 0.75, lineHeight: 1.4 }}>
          {alert.message}
        </p>
      </div>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        color: 'var(--c-muted)', flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

// ── Category Card ─────────────────────────────────────────────────
function CategoryCard({ category, spent, income, daysElapsed, daysInMonth, onClick }) {
  const limit = (category.percentage / 100) * income;
  const pct = Math.min(100, (spent / limit) * 100);
  const info = paceInfo(spent, limit, daysElapsed, daysInMonth);
  const tones = { safe: 'safe', warn: 'warn', danger: 'danger' };
  const tone = tones[info.tone];
  return (
    <div onClick={onClick} className="pressable" style={{
      background: 'var(--c-surface)', borderRadius: 'var(--r-lg)',
      border: '1px solid var(--c-border)', padding: '14px 16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `var(--c-${tone}-light)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            {category.icon}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px' }}>{category.label}</p>
            <p style={{ fontSize: 12, color: 'var(--c-muted)' }}>{category.percentage}% · {fmtHUF(limit)}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.5px', color: `var(--c-${tone})` }}>
            {fmtHUF(spent)}
          </p>
          <Badge tone={tone}>{info.label}</Badge>
        </div>
      </div>
      <ProgressBar value={pct} max={100} tone={tone} height={6} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--c-muted)' }}>
          Elköltve: {pct.toFixed(0)}%
        </span>
        <span style={{ fontSize: 11, color: 'var(--c-muted)' }}>
          Maradék: {fmtHUF(Math.max(0, limit - spent))}
        </span>
      </div>
    </div>
  );
}

// ── Savings Goal Card ─────────────────────────────────────────────
function SavingsGoalCard({ goal }) {
  const pct = Math.min(100, (goal.current / goal.target) * 100);
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--c-brand-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="var(--c-brand)" strokeWidth="1.5"/>
              <path d="M9 5.5V9L11.5 11" stroke="var(--c-brand)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>{goal.label}</p>
            <p style={{ fontSize: 12, color: 'var(--c-muted)' }}>Megtakarítási cél</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-brand)', letterSpacing: '-0.5px' }}>
            {pct.toFixed(0)}%
          </p>
          <p style={{ fontSize: 11, color: 'var(--c-muted)' }}>
            {fmtHUF(goal.current)} / {fmtHUF(goal.target)}
          </p>
        </div>
      </div>
      <ProgressBar value={pct} max={100} tone={pct >= 100 ? 'safe' : 'brand'} height={8} />
    </Card>
  );
}

// ── Event Card ────────────────────────────────────────────────────
function EventCard({ event, onDelete }) {
  const days = daysUntil(event.date);
  const urgent = days <= 14;
  return (
    <Card padding="14px 16px">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: urgent ? 'var(--c-warn-light)' : 'var(--c-brand-light)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: urgent ? 'var(--c-warn)' : 'var(--c-brand)', lineHeight: 1 }}>
            {new Date(event.date).toLocaleDateString('hu-HU', { month: 'short' }).toUpperCase()}
          </span>
          <span style={{ fontSize: 17, fontWeight: 700, color: urgent ? 'var(--c-warn)' : 'var(--c-brand)', lineHeight: 1 }}>
            {new Date(event.date).getDate()}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px', marginBottom: 2 }}>{event.name}</p>
          <p style={{ fontSize: 12, color: 'var(--c-muted)' }}>
            {days > 0 ? `${days} nap múlva` : 'Ma'} · {fmtHUF(event.estimatedCost)}
          </p>
        </div>
        <Badge tone={urgent ? 'warn' : 'brand'}>{days}n</Badge>
      </div>
    </Card>
  );
}

// ── Amount Numpad ─────────────────────────────────────────────────
function AmountNumpad({ value, onChange }) {
  const display = value === 0 ? '0' : value.toLocaleString('hu-HU');
  function press(key) {
    if (key === '⌫') {
      onChange(Math.floor(value / 10));
    } else if (key === '000') {
      onChange(value * 1000);
    } else {
      const next = value * 10 + parseInt(key);
      if (next <= 9999999) onChange(next);
    }
  }
  const keys = ['1','2','3','4','5','6','7','8','9','000','0','⌫'];
  return (
    <div>
      <div style={{
        textAlign: 'center', padding: '8px 20px 16px',
        fontSize: 40, fontWeight: 700, letterSpacing: '-2px',
        fontVariantNumeric: 'tabular-nums',
        color: value > 0 ? 'var(--c-text)' : 'var(--c-muted-2)',
        borderBottom: '1px solid var(--c-border)',
        marginBottom: 4,
      }}>
        {display} <span style={{ fontSize: 20, fontWeight: 500, color: 'var(--c-muted)' }}>Ft</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--c-border)' }}>
        {keys.map(k => (
          <button key={k} onClick={() => press(k)} style={{
            height: 56, background: k === '⌫' ? 'var(--c-surface-2)' : 'var(--c-surface)',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: k === '⌫' ? 20 : 20, fontWeight: 500, color: 'var(--c-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.1s',
            WebkitTapHighlightColor: 'transparent',
          }}
          onTouchStart={e => e.currentTarget.style.background = 'var(--c-surface-2)'}
          onTouchEnd={e => e.currentTarget.style.background = k === '⌫' ? 'var(--c-surface-2)' : 'var(--c-surface)'}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Back button ───────────────────────────────────────────────────
function BackBtn({ onBack, label = '' }) {
  return (
    <button onClick={onBack} style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 17, color: 'var(--c-brand)', fontWeight: 500,
      padding: '8px 0', WebkitTapHighlightColor: 'transparent',
    }}>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
        <path d="M8 2L2 8L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label || 'Vissza'}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, type = 'text', suffix, hint }) {
  return (
    <div>
      {label && <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-muted)', marginBottom: 6 }}>{label}</p>}
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', height: 52,
            background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)',
            borderRadius: 'var(--r-md)', padding: suffix ? '0 48px 0 16px' : '0 16px',
            fontSize: 15, fontFamily: 'inherit', color: 'var(--c-text)',
            outline: 'none', transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--c-brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--c-border)'}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, color: 'var(--c-muted)', fontWeight: 500,
          }}>{suffix}</span>
        )}
      </div>
      {hint && <p style={{ fontSize: 12, color: 'var(--c-muted)', marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

Object.assign(window, {
  fmtHUF, fmtShort, fmtDate, daysUntil, isThisMonth, paceInfo,
  Card, SectionHeader, SafeToSpendHero, AlertBanner,
  CategoryCard, SavingsGoalCard, EventCard,
  AmountNumpad, BackBtn, Input,
});
