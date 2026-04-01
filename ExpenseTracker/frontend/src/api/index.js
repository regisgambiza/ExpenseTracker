import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getSettings = () => api.get('/settings').then(r => r.data)
export const saveSettings = (data) => api.put('/settings', data)

export const listMonths = () => api.get('/months').then(r => r.data)
export const getMonth = (year, month) => api.get(`/months/${year}/${month}`).then(r => r.data)
export const createMonth = (year, month, copyFrom) =>
  api.post('/months', { year, month, copy_from: copyFrom }).then(r => r.data)

export const createEntry = (data) => api.post('/entries', data).then(r => r.data)
export const updateEntry = (id, data) => api.put(`/entries/${id}`, data)
export const deleteEntry = (id) => api.delete(`/entries/${id}`)

export const getPayments = (entryId) => api.get(`/entries/${entryId}/payments`).then(r => r.data)
export const createPayment = (entryId, data) => api.post(`/entries/${entryId}/payments`, data).then(r => r.data)
export const deletePayment = (id) => api.delete(`/payments/${id}`)

// Independent debts API
export const getDebts = () => api.get('/debts').then(r => r.data)
export const createDebt = (data) => api.post('/debts', data).then(r => r.data)
export const updateDebt = (id, data) => api.put(`/debts/${id}`, data)
export const deleteDebt = (id) => api.delete(`/debts/${id}`)
export const getDebtPayments = (debtId) => api.get(`/debts/${debtId}/payments`).then(r => r.data)
export const createDebtPayment = (debtId, data) => api.post(`/debts/${debtId}/payments`, data).then(r => r.data)
export const deleteDebtPayment = (debtId, paymentId) => api.delete(`/debts/${debtId}/payments/${paymentId}`)

// Credit cards API
export const getCreditCards = () => api.get('/credit_cards').then(r => r.data)
export const createCreditCard = (data) => api.post('/credit_cards', data).then(r => r.data)
export const updateCreditCard = (id, data) => api.put(`/credit_cards/${id}`, data)
export const deleteCreditCard = (id) => api.delete(`/credit_cards/${id}`)
export const getCreditCardPayments = (ccId) => api.get(`/credit_cards/${ccId}/payments`).then(r => r.data)
export const createCreditCardPayment = (ccId, data) => api.post(`/credit_cards/${ccId}/payments`, data).then(r => r.data)
export const deleteCreditCardPayment = (ccId, paymentId) => api.delete(`/credit_cards/${ccId}/payments/${paymentId}`)

// Bank accounts API
export const getBankAccounts = () => api.get('/bank_accounts').then(r => r.data)
export const createBankAccount = (data) => api.post('/bank_accounts', data).then(r => r.data)
export const updateBankAccount = (id, data) => api.put(`/bank_accounts/${id}`, data)
export const deleteBankAccount = (id) => api.delete(`/bank_accounts/${id}`)
