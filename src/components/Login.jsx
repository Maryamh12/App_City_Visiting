import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import api from '../api'
import ErrorMessage from './ErrorMessage'
import '../style/Auth.css'

const Login = ({ setIsTransparentNav }) => {
  const [formData,        setFormData]        = useState({ email: '', password: '' })
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error,           setError]           = useState(null)
  const [loading,         setLoading]         = useState(false)
  const navigate = useNavigate()

  useEffect(() => { setIsTransparentNav(false) }, [])

  const onChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError({ message: 'Please fill in both email and password.', needsLogin: false })
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/login', formData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.payload.id)
      navigate('/tourbrows')
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        setError({ message: 'Incorrect email or password. Please try again.', needsLogin: false })
      } else if (!err.response) {
        setError({ message: 'Cannot reach the server. Is the API running?', needsLogin: false })
      } else {
        setError({ message: err.response?.data?.message ?? 'Login failed. Please try again.', needsLogin: false })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-media">
        <img
          src="https://images.pexels.com/photos/17411075/pexels-photo-17411075/free-photo-of-street-in-old-town.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Old town street"
        />
      </div>

      <div className="auth-panel">
        <div className="auth-form-wrap">
          <h1 className="auth-heading">Sign in</h1>

          <form onSubmit={onSubmit} noValidate>
            <label className="field-label" htmlFor="email">Email</label>
            <input
              className="field-input"
              id="email" type="email" name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={onChange} required
            />

            <label className="field-label" htmlFor="password">Password</label>
            <div className="field-password">
              <input
                className="field-input"
                id="password"
                type={passwordVisible ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={onChange} required
              />
              <button
                type="button"
                className="field-eye"
                onClick={() => setPasswordVisible(v => !v)}
                aria-label="Toggle password"
              >
                <FontAwesomeIcon icon={passwordVisible ? faEye : faEyeSlash} />
              </button>
            </div>

            <ErrorMessage
              message={error?.message}
              needsLogin={false}
              onDismiss={() => setError(null)}
            />

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            No account?{' '}
            <Link to="/Register" className="auth-switch-link">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
