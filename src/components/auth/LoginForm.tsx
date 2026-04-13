'use client'

import { useState } from 'react'
import { signInAction } from '@/app/(auth)/login/actions'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signInAction(email, password)

    // If result has error, show it. If undefined, redirect() was called server-side.
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rosa-200 p-8">
      <h2 className="text-xl font-bold text-rosa-800 mb-6">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-rosa-700 mb-1">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-rosa-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400 focus:border-transparent"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-rosa-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-rosa-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rosa-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-rosa-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  )
}
