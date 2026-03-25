import { useState } from 'react'
import { useBudget } from './hooks/useBudget'
import Column, { SubTotal, SectionLabel } from './components/Column'
import Summary from './components/Summary'
import EditableCard from './components/EditableCard'

const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

export default function App() {
  const b = useBudget()

  if (b.loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '.1em' }}>
      LOADING...
    </div>
  )

  const { stats, rate } = b

  return (
    <div style={{ minHeight: '100vh', padding: '20px 24px 40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ fontSize: 22, color: 'var(--accent)', letterSpacing: '.05em' }}>EXPENSETRACKER</h1>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>budget board</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Month nav */}
          <button onClick={() => b.navigate(-1)} style={navBtn}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-display)', minWidth: 90, textAlign: 'center', color: 'var(--text)' }}>
            {b.monthLabel}
          </span>
          <button onClick={() => b.navigate(1)} style={navBtn}>›</button>

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

          <button
            onClick={() => { if (window.confirm(`Roll over to next month?`)) b.rollover() }}
            disabled={b.saving}
            style={{ ...navBtn, borderColor: '#1e3a50', color: 'var(--thb)', fontSize: 12 }}
          >
            {b.saving ? '...' : '↻ Rollover'}
          </button>

          <button
            onClick={() => b.setSettingsOpen(s => !s)}
            style={{ ...navBtn, color: b.settingsOpen ? 'var(--accent)' : 'var(--muted)', fontSize: 12 }}
          >
            ⚙ Settings
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {b.settingsOpen && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16
        }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 120 }}>ZAR / THB rate</span>
          <input
            type="range" min="1.2" max="2.2" step="0.01" value={b.rate}
            onChange={e => b.saveRate(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, minWidth: 36, color: 'var(--accent)' }}>{b.rate.toFixed(2)}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>1 ZAR = {b.rate.toFixed(2)} THB</span>
        </div>
      )}

      {/* Unpaid bills summary */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Bills to pay</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--thb)' }}>{fmt(stats.unpaidThb)} THB</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--zar)' }}>{fmt(stats.unpaidZar)} ZAR</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>(≈ {fmt(stats.unpaidZarThb)} THB)</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => b.setFilter('all')}
            style={{ ...filterBtn, background: b.filter === 'all' ? 'var(--accent)' : 'transparent', color: b.filter === 'all' ? '#000' : 'var(--muted)' }}
          >All</button>
          <button
            onClick={() => b.setFilter('unpaid')}
            style={{ ...filterBtn, background: b.filter === 'unpaid' ? 'var(--accent)' : 'transparent', color: b.filter === 'unpaid' ? '#000' : 'var(--muted)' }}
          >Unpaid</button>
          <button
            onClick={() => b.setFilter('paid')}
            style={{ ...filterBtn, background: b.filter === 'paid' ? 'var(--accent)' : 'transparent', color: b.filter === 'paid' ? '#000' : 'var(--muted)' }}
          >Paid</button>
        </div>
      </div>

      {/* Board */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', alignItems: 'flex-start', paddingBottom: 8 }}>

        {/* Income */}
        <Column
          title="Income"
          badge="THB"
          badgeColor="thb"
          entries={b.byCategory('income')}
          onAdd={() => b.addEntry('income', 'THB')}
          onUpdate={b.updateEntry}
          onDelete={b.removeEntry}
          footer={<SubTotal label="Total" value={stats.income} color="var(--success)" />}
        />

        {/* Thailand expenses */}
        <Column
          title="Thailand expenses"
          badge="THB"
          badgeColor="thb"
          entries={b.byCategory('thb')}
          onAdd={() => b.addEntry('thb', 'THB')}
          onUpdate={b.updateEntry}
          onDelete={b.removeEntry}
          footer={<SubTotal label="Total" value={stats.thbExp} />}
        />

        {/* SA expenses */}
        <Column
          title="SA expenses"
          badge="ZAR"
          badgeColor="zar"
          entries={b.byCategory('zar')}
          onAdd={() => b.addEntry('zar', 'ZAR')}
          onUpdate={b.updateEntry}
          onDelete={b.removeEntry}
          footer={
            <>
              <SubTotal label="Total (ZAR)" value={stats.zarExp} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>≈ THB</span>
                <input
                  type="number"
                  value={b.zarThbManual || ''}
                  onChange={e => b.saveZarThbManual(parseFloat(e.target.value) || 0)}
                  placeholder={stats.zarThb.toFixed(2)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border2)',
                    borderRadius: 'var(--radius)',
                    padding: '2px 6px',
                    fontSize: 12,
                    color: b.zarThbManual ? 'var(--accent)' : 'var(--muted)',
                    width: 80,
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none'
                  }}
                  title="Enter manual THB total (leave empty for auto calculation)"
                />
              </div>
            </>
          }
        />

        {/* Debts column */}
        <div style={{
          flex: '0 0 240px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 12,
        }}>
          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--font-display)' }}>
            Debts
          </span>

          <SectionLabel>I owe</SectionLabel>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>click name or amount to edit</div>
          {b.byCategory('owing').map(e => (
            <EditableCard key={e.id} entry={e} onUpdate={b.updateEntry} onDelete={b.removeEntry} showCurrency />
          ))}
          <button onClick={() => b.addEntry('owing', 'THB')} style={addBtn}>+ add person</button>
          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 5px' }} />
          <SubTotal label="Total owing (THB)" value={stats.owingThb} color="var(--danger)" />

          <SectionLabel>Owed to me</SectionLabel>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>click name or amount to edit</div>
          {b.byCategory('owed').map(e => (
            <EditableCard key={e.id} entry={e} onUpdate={b.updateEntry} onDelete={b.removeEntry} showCurrency />
          ))}
          <button onClick={() => b.addEntry('owed', 'THB')} style={addBtn}>+ add person</button>
          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 5px' }} />
          <SubTotal label="Total owed (THB)" value={stats.owedThb} color="var(--success)" />
          <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0 4px' }} />
          <SubTotal
            label="Net position"
            value={(stats.netDebt >= 0 ? '+' : '') + fmt(stats.netDebt)}
            color={stats.netDebt >= 0 ? 'var(--success)' : 'var(--danger)'}
          />
        </div>

        {/* Summary */}
        <Summary stats={stats} />

      </div>
    </div>
  )
}

const navBtn = {
  background: 'none',
  border: '1px solid var(--border2)',
  borderRadius: 'var(--radius)',
  padding: '4px 10px',
  color: 'var(--text)',
  fontSize: 13,
}

const addBtn = {
  width: '100%',
  fontSize: 12,
  color: 'var(--muted)',
  border: '1px dashed var(--border2)',
  background: 'transparent',
  padding: '5px',
  borderRadius: 'var(--radius)',
  marginTop: 2,
}

const filterBtn = {
  fontSize: 11,
  padding: '4px 10px',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border2)',
  background: 'transparent',
  color: 'var(--muted)',
  cursor: 'pointer',
  fontWeight: 500,
}
