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
