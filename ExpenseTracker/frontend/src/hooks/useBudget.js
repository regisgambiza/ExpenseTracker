import { useState, useEffect, useCallback } from 'react'
import * as api from '../api'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function useBudget() {
  const now = new Date()
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(3)
  const [data, setData] = useState(null)
  const [rate, setRate] = useState(1.65)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'unpaid', 'paid'
  const [zarThbManual, setZarThbManual] = useState(null)
  const [debts, setDebts] = useState([])
  const [creditCards, setCreditCards] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])

  const load = useCallback(async (y, m) => {
    setLoading(true)
    try {
      const [monthData, settings, debtsData, creditCardsData, bankAccountsData] = await Promise.all([
        api.getMonth(y, m).catch(() => null),
        api.getSettings(),
        api.getDebts(),
        api.getCreditCards(),
        api.getBankAccounts()
      ])
      setRate(parseFloat(settings.zar_thb_rate || 1.65))
      setZarThbManual(settings.zar_thb_manual_total ? parseFloat(settings.zar_thb_manual_total) : null)
      setDebts(debtsData || [])
      setCreditCards(creditCardsData || [])
      setBankAccounts(bankAccountsData || [])
      if (monthData) {
        setData(monthData)
      } else {
        // month doesn't exist yet — show empty shell
        setData({ month: { id: null, year: y, month: m }, entries: [] })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(year, month) }, [year, month, load])

  const navigate = (dir) => {
    let m = month + dir, y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    setYear(y); setMonth(m)
  }

  const rollover = async () => {
    setSaving(true)
    try {
      const nextM = month === 12 ? 1 : month + 1
      const nextY = month === 12 ? year + 1 : year
      await api.createMonth(nextY, nextM, { year, month })
      setYear(nextY); setMonth(nextM)
    } finally {
      setSaving(false)
    }
  }

  const saveRate = async (newRate) => {
    setRate(newRate)
    await api.saveSettings({ zar_thb_rate: newRate })
  }

  const saveZarThbManual = async (value) => {
    setZarThbManual(value)
    if (value === null || value === 0) {
      // don't save zero/empty - let it use auto calculation
      await api.saveSettings({ zar_thb_manual_total: '' })
    } else {
      await api.saveSettings({ zar_thb_manual_total: value })
    }
  }

  const ensureMonth = async () => {
    if (data?.month?.id) return data.month.id
    const result = await api.createMonth(year, month, null)
    const refreshed = await api.getMonth(year, month)
    setData(refreshed)
    return result.id
  }

  const addEntry = async (category, currency = 'THB') => {
    const monthId = await ensureMonth()
    const entry = await api.createEntry({
      month_id: monthId,
      category,
      label: 'New item',
      amount: 0,
      currency
    })
    setData(prev => ({
      ...prev,
      entries: [...(prev?.entries || []), {
        id: entry.id, category, label: 'New item', amount: 0, currency, sort_order: 999
      }]
    }))
  }

  const updateEntry = async (id, changes) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, ...changes } : e)
    }))
    await api.updateEntry(id, changes)
  }

  const removeEntry = async (id) => {
    setData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }))
    await api.deleteEntry(id)
  }

  // Debt functions (independent from months)
  const addDebt = async (type, currency = 'THB') => {
    const debt = await api.createDebt({
      type,
      label: 'New debt',
      amount: 0,
      currency
    })
    setDebts(prev => [...prev, {
      id: debt.id, type, label: 'New debt', original_amount: 0, currency, total_paid: 0
    }])
  }

  const updateDebt = async (id, changes) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...changes } : d))
    await api.updateDebt(id, changes)
  }

  const deleteDebt = async (id) => {
    setDebts(prev => prev.filter(d => d.id !== id))
    await api.deleteDebt(id)
  }

  // Credit card functions
  const addCreditCard = async () => {
    const cc = await api.createCreditCard({
      name: 'New Card',
      credit_limit: 0,
      currency: 'THB'
    })
    setCreditCards(prev => [...prev, {
      id: cc.id, name: 'New Card', credit_limit: 0, currency: 'THB', total_paid: 0
    }])
  }

  const updateCreditCard = async (id, changes) => {
    setCreditCards(prev => prev.map(cc => cc.id === id ? { ...cc, ...changes } : cc))
    await api.updateCreditCard(id, changes)
  }

  const deleteCreditCard = async (id) => {
    setCreditCards(prev => prev.filter(cc => cc.id !== id))
    await api.deleteCreditCard(id)
  }

  // Bank account functions
  const addBankAccount = async () => {
    const acc = await api.createBankAccount({
      name: 'New Account',
      purpose: '',
      balance: 0,
      currency: 'THB'
    })
    setBankAccounts(prev => [...prev, {
      id: acc.id, name: 'New Account', purpose: '', balance: 0, currency: 'THB'
    }])
  }

  const updateBankAccount = async (id, changes) => {
    setBankAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...changes } : acc))
    await api.updateBankAccount(id, changes)
  }

  const deleteBankAccount = async (id) => {
    setBankAccounts(prev => prev.filter(acc => acc.id !== id))
    await api.deleteBankAccount(id)
  }

  const entries = data?.entries || []

  const filterByPaid = (ents) => {
    if (filter === 'unpaid') return ents.filter(e => !e.paid)
    if (filter === 'paid') return ents.filter(e => e.paid)
    return ents
  }

  const byCategory = (cat) => {
    const ents = filterByPaid(entries.filter(e => e.category === cat))
    // Sort: unpaid first, then paid (paid items go to bottom)
    return ents.sort((a, b) => {
      if (a.paid && !b.paid) return 1
      if (!a.paid && b.paid) return -1
      return (a.sort_order || 0) - (b.sort_order || 0)
    })
  }

  const toThb = (amount, currency) => currency === 'ZAR' ? amount * rate : amount

  const sumThb = (cat) => byCategory(cat).reduce((s, e) => s + toThb(parseFloat(e.amount) || 0, e.currency), 0)
  const sumRaw = (cat) => byCategory(cat).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)

  const income = sumRaw('income')
  const thbExp = sumRaw('thb')
  const zarExp = sumRaw('zar')
  const zarThb = zarThbManual !== null && zarThbManual > 0 ? zarThbManual : zarExp * rate
  const totalExp = thbExp + zarThb
  const surplus = income - totalExp
  const savRate = income ? Math.round((surplus / income) * 100) : 0
  
  // Calculate debts from independent debts table
  const owingDebts = debts.filter(d => d.type === 'owing')
  const owedDebts = debts.filter(d => d.type === 'owed')
  const owedThb = owedDebts.reduce((s, d) => s + toThb((parseFloat(d.original_amount) || 0) - (parseFloat(d.total_paid) || 0), d.currency), 0)
  const owingThb = owingDebts.reduce((s, d) => s + toThb((parseFloat(d.original_amount) || 0) - (parseFloat(d.total_paid) || 0), d.currency), 0)
  const netDebt = owedThb - owingThb

  // Unpaid totals (for expense categories only)
  const unpaidZar = entries.filter(e => e.category === 'zar' && !e.paid)
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  // Calculate unpaid THB for SA using manual rate if set, otherwise use exchange rate
  const zarToThbRate = zarThbManual !== null && zarThbManual > 0 && zarExp > 0
    ? zarThbManual / zarExp
    : rate
  const unpaidZarThb = unpaidZar * zarToThbRate
  const unpaidThb = entries.filter(e => e.category === 'thb' && !e.paid)
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const totalUnpaid = unpaidThb + unpaidZarThb

  const monthLabel = `${MONTHS[month - 1]} ${year}`

  return {
    year, month, monthLabel, data, loading, saving,
    rate, saveRate,
    zarThbManual, saveZarThbManual,
    settingsOpen, setSettingsOpen,
    filter, setFilter,
    navigate, rollover,
    byCategory, addEntry, updateEntry, removeEntry, toThb,
    debts, addDebt, updateDebt, deleteDebt,
    creditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
    stats: { income, thbExp, zarExp, zarThb, totalExp, surplus, savRate, owedThb, owingThb, netDebt, unpaidThb, unpaidZar, unpaidZarThb, totalUnpaid }
  }
}
