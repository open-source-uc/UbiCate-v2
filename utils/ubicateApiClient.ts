import { ofetch } from 'ofetch'

export const apiClient = ofetch.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  onRequest({ request, options }) {
    const token = sessionStorage.getItem('ubicateToken')
    if (token) {
      options.headers.set('ubicate-token', token)
    }
  },
})