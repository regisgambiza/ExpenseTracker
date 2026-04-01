import BankAccountCard from './BankAccountCard'

const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

export default function BankAccountColumn({ bankAccounts, onAdd, onUpdate, onDelete, footer }) {
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--font-display)' }}>
          Bank Accounts
        </span>
        <button onClick={onAdd} style={addBtn}>+ add account</button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 10,
        fontWeight: 500,
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '.07em',
        marginBottom: 5,
        fontFamily: 'var(--font-display)'
      }}>
        <span style={{
          background: 'linear-gradient(135deg, #0f4c3a, #1b5e52)',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: 'var(--radius)',
          fontSize: 9,
          fontWeight: 600
        }}>BALANCE</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>click to edit</div>
      
      {/* Account cards side by side */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {bankAccounts.map(acc => (
          <div key={acc.id} style={{ flex: '1 1 200px', minWidth: '200px' }}>
            <BankAccountCard account={acc} onUpdate={onUpdate} onDelete={onDelete} />
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0 5px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Total</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>{fmt(totalBalance)} THB</span>
      </div>

      {footer && (
        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 5px' }}>
          {footer}
        </div>
      )}
    </div>
  )
}

const addBtn = {
  fontSize: 10,
  color: 'var(--muted)',
  border: '1px dashed var(--border2)',
  background: 'transparent',
  padding: '2px 6px',
  borderRadius: 'var(--radius)',
  cursor: 'pointer',
}
