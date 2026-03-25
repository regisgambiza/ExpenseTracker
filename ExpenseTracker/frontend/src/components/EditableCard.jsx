import { useState, useRef, useEffect } from 'react'
import PaymentHistory from './PaymentHistory'

const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

export default function EditableCard({ entry, onUpdate, onDelete, showCurrency = false }) {
  const [editingLabel, setEditingLabel] = useState(false)
  const [editingAmount, setEditingAmount] = useState(false)
  const [labelVal, setLabelVal] = useState(entry.label)
  const [amountVal, setAmountVal] = useState(entry.amount)
  const [showPayments, setShowPayments] = useState(false)
  const labelRef = useRef()
  const amountRef = useRef()

  useEffect(() => { if (editingLabel) labelRef.current?.focus() }, [editingLabel])
  useEffect(() => { if (editingAmount) amountRef.current?.select() }, [editingAmount])

  const commitLabel = () => {
    setEditingLabel(false)
    if (labelVal !== entry.label) onUpdate(entry.id, { label: labelVal })
  }
  const commitAmount = () => {
    setEditingAmount(false)
    const v = parseFloat(amountVal) || 0
    if (v !== entry.amount) onUpdate(entry.id, { amount: v })
  }

  const isPaid = entry.paid || false
  const isDebt = entry.category === 'owed' || entry.category === 'owing'

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
      opacity: isPaid ? 0.5 : 1,
      transition: 'border-color .15s',
      position: 'relative'
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <input
        type="checkbox"
        checked={isPaid}
        onChange={() => onUpdate(entry.id, { paid: !isPaid })}
        style={{ cursor: 'pointer', accentColor: 'var(--success)', width: 14, height: 14, flexShrink: 0 }}
        title={isPaid ? 'Mark as unpaid' : 'Mark as paid'}
      />

      {editingLabel ? (
        <input
          ref={labelRef}
          value={labelVal}
          onChange={e => setLabelVal(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={e => e.key === 'Enter' && commitLabel()}
          style={{ ...inputStyle, textDecoration: isPaid ? 'line-through' : 'none' }}
        />
      ) : (
        <span
          onClick={() => setEditingLabel(true)}
          style={{ flex: 1, color: 'var(--text)', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: isPaid ? 'line-through' : 'none' }}
          title="click to edit"
        >{entry.label}</span>
      )}

      {showCurrency && (
        <select
          value={entry.currency}
          onChange={e => onUpdate(entry.id, { currency: e.target.value })}
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border2)', color: 'var(--muted)', fontSize: 11, outline: 'none', cursor: 'pointer' }}
          disabled={isPaid}
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
          style={{ ...inputStyle, width: 80, textAlign: 'right', textDecoration: isPaid ? 'line-through' : 'none' }}
        />
      ) : (
        <span
          onClick={() => { setAmountVal(entry.amount); setEditingAmount(true) }}
          style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--text)', whiteSpace: 'nowrap', textDecoration: isPaid ? 'line-through' : 'none' }}
          title="click to edit"
        >{fmt(entry.amount)}</span>
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

      <button
        onClick={() => onDelete(entry.id)}
        style={{ background: 'none', border: 'none', color: 'var(--faint)', fontSize: 12, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
        onMouseEnter={e => e.target.style.color = 'var(--danger)'}
        onMouseLeave={e => e.target.style.color = 'var(--faint)'}
      >✕</button>

      {showPayments && isDebt && (
        <PaymentHistory entry={entry} onClose={() => setShowPayments(false)} />
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
