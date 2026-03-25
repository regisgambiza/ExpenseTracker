import EditableCard from './EditableCard'

const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

export default function Column({ title, badge, badgeColor, entries, onAdd, onUpdate, onDelete, showCurrency, footer }) {
  return (
    <div style={{
      flex: '0 0 230px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--font-display)' }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 500,
            background: badgeColor === 'thb' ? '#1a2e3a' : badgeColor === 'zar' ? '#1a2e1f' : badgeColor === 'owing' ? '#2e1a1a' : '#1a2e1f',
            color: badgeColor === 'thb' ? 'var(--thb)' : badgeColor === 'zar' ? 'var(--zar)' : badgeColor === 'owing' ? 'var(--danger)' : 'var(--success)',
          }}>{badge}</span>
        )}
      </div>

      {entries.map(e => (
        <EditableCard
          key={e.id}
          entry={e}
          onUpdate={onUpdate}
          onDelete={onDelete}
          showCurrency={showCurrency}
        />
      ))}

      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            width: '100%', fontSize: 12, color: 'var(--muted)',
            border: '1px dashed var(--border2)', background: 'transparent',
            padding: '5px', borderRadius: 'var(--radius)', marginTop: 2,
          }}
          onMouseEnter={e => e.target.style.color = 'var(--text)'}
          onMouseLeave={e => e.target.style.color = 'var(--muted)'}
        >+ add</button>
      )}

      {footer && (
        <>
          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 4px' }} />
          {footer}
        </>
      )}
    </div>
  )
}

export function SubTotal({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: color || 'var(--text)' }}>
        {Math.round(parseFloat(value) || 0).toLocaleString()}
      </span>
    </div>
  )
}

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', margin: '12px 0 5px 1px', fontFamily: 'var(--font-display)' }}>
      {children}
    </div>
  )
}
