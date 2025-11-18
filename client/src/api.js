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