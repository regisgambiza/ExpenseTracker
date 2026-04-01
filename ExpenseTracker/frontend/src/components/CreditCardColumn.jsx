import CreditCardCard from './CreditCardCard'

const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

export default function CreditCardColumn({ creditCards, onAdd, onUpdate, onDelete, footer }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 12,
    }}>
      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--font-display)' }}>
        Credit Cards
      </span>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 10,
        fontWeight: 500,
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '.07em',
        margin: '12px 0 5px 1px',
        fontFamily: 'var(--font-display)'
      }}>
        <span style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2d5a87)',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: 'var(--radius)',
          fontSize: 9,
          fontWeight: 600
        }}>CARDS</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>click name or limit to edit</div>
      {creditCards.map(cc => (
        <CreditCardCard key={cc.id} creditCard={cc} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
      <button onClick={onAdd} style={addBtn}>+ add card</button>
      
      {footer && (
        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 5px' }}>
          {footer}
        </div>
      )}
    </div>
  )
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
