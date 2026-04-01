import { useState, useRef, useEffect } from 'react'
import PaymentHistory from './PaymentHistory'

const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

export default function EditableCard({ entry, onUpdate, onDelete, showCurrency = false }) {
  const [editingLabel, setEditingLabel] = useState(false)
  const [editingAmount, setEditingAmount] = useState(false)
  const [labelVal, setLabelVal] = useState(entry.label)
  const [showPayments, setShowPayments] = useState(false)
  const labelRef = useRef()
  const amountRef = useRef()

  const isDebt = entry.type === 'owed' || entry.type === 'owing'
  const amount = isDebt ? (entry.original_amount !== undefined ? entry.original_amount : 0) : (entry.amount !== undefined ? entry.amount : 0)
  const [amountVal, setAmountVal] = useState(amount)

  useEffect(() => { if (editingLabel) labelRef.current?.focus() }, [editingLabel])
  useEffect(() => { if (editingAmount) amountRef.current?.select() }, [editingAmount])

  // Update local amountVal when entry.amount changes
  useEffect(() => {
    setAmountVal(amount)
  }, [amount])

  const commitLabel = () => {
    setEditingLabel(false)
    if (labelVal !== entry.label) onUpdate(entry.id, { label: labelVal })
  }
  const commitAmount = () => {
    setEditingAmount(false)
    const v = parseFloat(amountVal) || 0
    if (isDebt) {
      if (v !== amount) onUpdate(entry.id, { original_amount: v })
    } else {
      if (v !== amount) onUpdate(entry.id, { amount: v })
    }
  }

  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '8px 10px',
      marginBottom: 5,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      transition: 'border-color .15s',
      position: 'relative'
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {editingLabel ? (
        <input
          ref={labelRef}
          value={labelVal}
          onChange={e => setLabelVal(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={e => e.key === 'Enter' && commitLabel()}
          style={{ ...inputStyle }}
        />
      ) : (
        <span
          onClick={() => setEditingLabel(true)}
          style={{ flex: 1, color: 'var(--text)', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: entry.paid ? 'line-through' : 'none', opacity: entry.paid ? 0.6 : 1 }}
          title="click to edit"
        >{entry.label}</span>
      )}

      {showCurrency && (
        <select
          value={entry.currency}
          onChange={e => onUpdate(entry.id, { currency: e.target.value })}
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border2)', color: 'var(--muted)', fontSize: 11, outline: 'none', cursor: 'pointer' }}
        >
          <option value="THB">THB</option>
          <option value="ZAR">ZAR</option>
        </select>
      )}

      {editingAmount ? (
        <input
          ref={amountRef}
          type="number"
          value={amountVal}
          onChange={e => setAmountVal(e.target.value)}
          onBlur={commitAmount}
          onKeyDown={e => e.key === 'Enter' && commitAmount()}
          style={{ ...inputStyle, width: 80, textAlign: 'right' }}
        />
      ) : (
        <span
          onClick={() => { setAmountVal(amount); setEditingAmount(true) }}
          style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--text)', whiteSpace: 'nowrap', textDecoration: entry.paid ? 'line-through' : 'none', opacity: entry.paid ? 0.6 : 1 }}
          title="click to edit"
        >{fmt(amount)}</span>
      )}

      {isDebt && (
        <button
          onClick={() => setShowPayments(!showPayments)}
          style={{
            background: 'none',
            border: 'none',
            color: showPayments ? 'var(--accent)' : 'var(--muted)',
            fontSize: 11,
            padding: '0 4px',
            lineHeight: 1,
            flexShrink: 0,
            cursor: 'pointer',
            fontWeight: 500
          }}
          onMouseEnter={e => e.target.style.color = 'var(--accent)'}
          onMouseLeave={e => e.target.style.color = showPayments ? 'var(--accent)' : 'var(--muted)'}
          title="View payment history"
        >
          📋
        </button>
      )}

      {!isDebt && (
        <button
          onClick={() => onUpdate(entry.id, { paid: !entry.paid })}
          style={{
            background: 'none',
            border: 'none',
            color: entry.paid ? 'var(--success)' : 'var(--muted)',
            fontSize: 14,
            padding: '0 4px',
            lineHeight: 1,
            flexShrink: 0,
            cursor: 'pointer',
            fontWeight: 500,
            opacity: entry.paid ? 1 : 0.4
          }}
          onMouseEnter={e => e.target.style.opacity = 1}
          onMouseLeave={e => e.target.style.opacity = entry.paid ? 1 : 0.4}
          title={entry.paid ? 'Mark as unpaid' : 'Mark as paid'}
        >
          ✓
        </button>
      )}

      <button
        onClick={() => onDelete(entry.id)}
        style={{ background: 'none', border: 'none', color: 'var(--faint)', fontSize: 12, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
        onMouseEnter={e => e.target.style.color = 'var(--danger)'}
        onMouseLeave={e => e.target.style.color = 'var(--faint)'}
      >✕</button>

      {showPayments && isDebt && (
        <PaymentHistory debt={entry} onClose={() => setShowPayments(false)} />
      )}
    </div>
  )
}

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--accent)',
  outline: 'none',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
}
