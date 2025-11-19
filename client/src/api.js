import axios from 'axios'


export const api = axios.create({
baseURL: import.meta.env.VITE_API_BASE,
withCredentials: true
})


export const fetchMe = () => api.get('/auth/me').then(r => r.data)
export const logout = () => api.post('/auth/logout').then(r => r.data)


export const fetchTransactions = (params) => api.get('/transactions', { params }).then(r => r.data)
export const createTransaction = (data) => api.post('/transactions', data).then(r => r.data)
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data).then(r => r.data)
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`).then(r => r.data)
export const fetchDashboardSummary = () => api.get('/summary').then(r => r.data)
export const updatePaymentStatus = (id, data) => api.post(`/transactions/${id}/payments`, data).then(r => r.data)
export const fetchPaymentHistory = () => api.get('/transactions/payments/history').then(r => r.data)
export const updateTransactionReminder = (id, data) => api.patch(`/transactions/${id}/reminder`, data).then(r => r.data)
export const extractTransactionsFromFile = (file) => {
const form = new FormData()
form.append('file', file)
return api.post('/transactions/extract', form, {
headers: { 'Content-Type': 'multipart/form-data' }
}).then(r => r.data)
}
