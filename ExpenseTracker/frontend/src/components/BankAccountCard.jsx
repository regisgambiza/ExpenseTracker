import { useState, useRef, useEffect } from 'react'

const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

export default function BankAccountCard({ account, onUpdate, onDelete }) {
  const [editingName, setEditingName] = useState(false)
  const [editingPurpose, setEditingPurpose] = useState(false)
  const [editingBalance, setEditingBalance] = useState(false)
  const [nameVal, setNameVal] = useState(account.name)
  const [purposeVal, setPurposeVal] = useState(account.purpose || '')
  const [balanceVal, setBalanceVal] = useState(account.balance)
  const nameRef = useRef()
  const purposeRef = useRef()
  const balanceRef = useRef()

  useEffect(() => { if (editingName) nameRef.current?.focus() }, [editingName])
  useEffect(() => { if (editingPurpose) purposeRef.current?.focus() }, [editingPurpose])
  useEffect(() => { if (editingBalance) balanceRef.current?.select() }, [editingBalance])

  const commitName = () => {
    setEditingName(false)
    if (nameVal !== account.name) onUpdate(account.id, { name: nameVal })
  }
  const commitPurpose = () => {
    setEditingPurpose(false)
    if (purposeVal !== account.purpose) onUpdate(account.id, { purpose: purposeVal })
  }
  const commitBalance = () => {
    setEditingBalance(false)
    const v = parseFloat(balanceVal) || 0
    if (v !== account.balance) onUpdate(account.id, { balance: v })
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
      {editingName ? (
        <input
          ref={nameRef}
          value={nameVal}
          onChange={e => setNameVal(e.target.value)}
          onBlur={commitName}
          onKeyDown={e => e.key === 'Enter' && commitName()}
          style={{ ...inputStyle, flex: 1 }}
        />
      ) : (
        <span
          onClick={() => setEditingName(true)}
          style={{ flex: 1, color: 'var(--text)', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}
          title="click to edit"
        >{account.name}</span>
      )}

      {editingPurpose ? (
        <input
          ref={purposeRef}
          value={purposeVal}
          onChange={e => setPurposeVal(e.target.value)}
          onBlur={commitPurpose}
          onKeyDown={e => e.key === 'Enter' && commitPurpose()}
          style={{ ...inputStyle, flex: 2 }}
        />
      ) : (
        <span
          onClick={() => setEditingPurpose(true)}
          style={{ flex: 2, color: 'var(--muted)', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}
          title="click to edit purpose"
        >{account.purpose || 'No purpose'}</span>
      )}

      {editingBalance ? (
        <input
          ref={balanceRef}
          type="number"
          value={balanceVal}
          onChange={e => setBalanceVal(e.target.value)}
          onBlur={commitBalance}
          onKeyDown={e => e.key === 'Enter' && commitBalance()}
          style={{ ...inputStyle, width: 80, textAlign: 'right' }}
        />
      ) : (
        <span
          onClick={() => { setBalanceVal(account.balance); setEditingBalance(true) }}
          style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--text)', whiteSpace: 'nowrap', fontSize: 12 }}
          title="click to edit balance"
        >{fmt(account.balance)}</span>
      )}

      <span style={{ fontSize: 9, color: 'var(--muted)', minWidth: 30 }}>{account.currency}</span>

      <button
        onClick={() => onDelete(account.id)}
        style={{ background: 'none', border: 'none', color: 'var(--faint)', fontSize: 12, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
        onMouseEnter={e => e.target.style.color = 'var(--danger)'}
        onMouseLeave={e => e.target.style.color = 'var(--faint)'}
      >✕</button>
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
