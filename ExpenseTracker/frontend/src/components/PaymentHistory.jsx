import { useState, useEffect } from 'react'
import { getDebtPayments, createDebtPayment, deleteDebtPayment } from '../api'

const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

export default function PaymentHistory({ debt, onClose }) {
  const [payments, setPayments] = useState([])
  const [newAmount, setNewAmount] = useState('')
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPayments()
  }, [debt.id])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const data = await getDebtPayments(debt.id)
      setPayments(data)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = async () => {
    const amount = parseFloat(newAmount) || 0
    if (!amount) return
    setSaving(true)
    try {
      await createDebtPayment(debt.id, {
        amount,
        payment_date: new Date().toISOString().split('T')[0],
        note: newNote
      })
      setNewAmount('')
      setNewNote('')
      await loadPayments()
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Delete this payment record?')) return
    await deleteDebtPayment(debt.id, id)
    await loadPayments()
  }

  const totalPaid = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
  const remaining = (parseFloat(debt.original_amount) || 0) - totalPaid

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: 12,
      marginTop: 8,
      zIndex: 10,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
          Payment History
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ marginBottom: 10, padding: 8, background: 'var(--surface2)', borderRadius: 'var(--radius)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: 'var(--muted)' }}>Original:</span>
          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{fmt(debt.original_amount)} {debt.currency}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: 'var(--muted)' }}>Paid:</span>
          <span style={{ color: 'var(--success)', fontWeight: 500 }}>{fmt(totalPaid)} {debt.currency}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderTop: '1px solid var(--border)', paddingTop: 4 }}>
          <span style={{ color: 'var(--muted)' }}>Remaining:</span>
          <span style={{ color: remaining > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>{fmt(remaining)} {debt.currency}</span>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>Add Payment</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input
            type="number"
            value={newAmount}
            onChange={e => setNewAmount(e.target.value)}
            placeholder="Amount"
            style={{
              flex: 1,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '4px 8px',
              fontSize: 12,
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
              outline: 'none'
            }}
          />
          <button
            onClick={handleAddPayment}
            disabled={saving || !newAmount}
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '4px 10px',
              fontSize: 12,
              color: '#000',
              fontWeight: 500,
              cursor: saving || !newAmount ? 'not-allowed' : 'pointer',
              opacity: saving || !newAmount ? 0.6 : 1
            }}
          >
            {saving ? '...' : '+ Add'}
          </button>
        </div>
        <input
          type="text"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Note (optional)"
          style={{
            width: '100%',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '4px 8px',
            fontSize: 12,
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>Payments</div>
      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: 11, padding: 8 }}>Loading...</div>
      ) : payments.length === 0 ? (
        <div style={{ color: 'var(--muted)', fontSize: 11, padding: 8, fontStyle: 'italic' }}>No payments yet</div>
      ) : (
        <div style={{ maxHeight: 150, overflowY: 'auto' }}>
          {payments.map(p => (
            <div key={p.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 0',
              borderBottom: '1px solid var(--border)',
              fontSize: 11
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{fmt(p.amount)} {debt.currency}</span>
                <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{p.payment_date}</span>
                {p.note && <span style={{ color: 'var(--muted)', marginLeft: 8, fontStyle: 'italic' }}>— {p.note}</span>}
              </div>
              <button
                onClick={() => handleDeletePayment(p.id)}
                style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: 12, padding: '2px 4px' }}
                onMouseEnter={e => e.target.style.color = 'var(--danger)'}
                onMouseLeave={e => e.target.style.color = 'var(--faint)'}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
