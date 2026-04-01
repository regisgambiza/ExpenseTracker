import { useState, useRef, useEffect } from 'react'
import CreditCardPaymentHistory from './CreditCardPaymentHistory'

const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

export default function CreditCardCard({ creditCard, onUpdate, onDelete }) {
  const [editingName, setEditingName] = useState(false)
  const [editingLimit, setEditingLimit] = useState(false)
  const [nameVal, setNameVal] = useState(creditCard.name)
  const [limitVal, setLimitVal] = useState(creditCard.credit_limit)
  const [showPayments, setShowPayments] = useState(false)
  const nameRef = useRef()
  const limitRef = useRef()

  useEffect(() => { if (editingName) nameRef.current?.focus() }, [editingName])
  useEffect(() => { if (editingLimit) limitRef.current?.select() }, [editingLimit])

  const commitName = () => {
    setEditingName(false)
    if (nameVal !== creditCard.name) onUpdate(creditCard.id, { name: nameVal })
  }
  const commitLimit = () => {
    setEditingLimit(false)
    const v = parseFloat(limitVal) || 0
    if (v !== creditCard.credit_limit) onUpdate(creditCard.id, { credit_limit: v })
  }

  const totalPaid = parseFloat(creditCard.total_paid) || 0
  const remaining = (parseFloat(creditCard.credit_limit) || 0) - totalPaid
  const utilization = creditCard.credit_limit > 0 ? (totalPaid / creditCard.credit_limit) * 100 : 0

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
      {editingName ? (
        <input
          ref={nameRef}
          value={nameVal}
          onChange={e => setNameVal(e.target.value)}
          onBlur={commitName}
          onKeyDown={e => e.key === 'Enter' && commitName()}
          style={{ ...inputStyle, flex: 2 }}
        />
      ) : (
        <span
          onClick={() => setEditingName(true)}
          style={{ flex: 2, color: 'var(--text)', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}
          title="click to edit"
        >{creditCard.name}</span>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {editingLimit ? (
          <input
            ref={limitRef}
            type="number"
            value={limitVal}
            onChange={e => setLimitVal(e.target.value)}
            onBlur={commitLimit}
            onKeyDown={e => e.key === 'Enter' && commitLimit()}
            style={{ ...inputStyle, width: 70, textAlign: 'right' }}
          />
        ) : (
          <span
            onClick={() => { setLimitVal(creditCard.credit_limit); setEditingLimit(true) }}
            style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--text)', whiteSpace: 'nowrap', fontSize: 12 }}
            title="click to edit limit"
          >{fmt(creditCard.credit_limit)}</span>
        )}
        <span style={{ fontSize: 9, color: remaining > 0 ? 'var(--success)' : 'var(--danger)', textAlign: 'right' }}>
          {fmt(remaining)} left
        </span>
      </div>

      {/* Utilization indicator */}
      <div style={{
        width: 40,
        height: 6,
        background: 'var(--surface)',
        borderRadius: 3,
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div style={{
          width: `${Math.min(utilization, 100)}%`,
          height: '100%',
          background: utilization > 80 ? 'var(--danger)' : utilization > 50 ? 'var(--accent)' : 'var(--success)',
          transition: 'width .3s, background .3s'
        }} />
      </div>

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

      <button
        onClick={() => onDelete(creditCard.id)}
        style={{ background: 'none', border: 'none', color: 'var(--faint)', fontSize: 12, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
        onMouseEnter={e => e.target.style.color = 'var(--danger)'}
        onMouseLeave={e => e.target.style.color = 'var(--faint)'}
      >✕</button>

      {showPayments && (
        <CreditCardPaymentHistory creditCard={creditCard} onClose={() => setShowPayments(false)} />
      )}
    </div>
  )
}

const inputStyle = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--accent)',
  outline: 'none',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
}
