import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Store } from 'lucide-react'
import { authApi } from './auth.api'
import { useAuthStore } from '@/store/authStore'
import type { AuthStore } from '@/store/authStore'

const C = {
  primary: '#2563EB', bg: '#F8FAFC', white: '#FFFFFF',
  border: '#E2E8F0', text: '#0F172A', muted: '#64748B',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: `1px solid ${C.border}`, borderRadius: 8,
  fontSize: 14, color: C.text, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
  background: C.white,
}

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s: AuthStore) => s.setAuth)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login({ email, password })
      setAuth(res.accessToken, res.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Marca */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, background: C.primary, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: '-0.5px' }}>
              MAQpos
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Panel Administrativo</p>
        </div>

        {/* Card */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '32px 36px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 17, fontWeight: 600, color: C.text }}>
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input
                type="email" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pos.com"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: error ? 12 : 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password} required
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', padding: 0 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: 11, background: loading ? '#93C5FD' : C.primary, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}