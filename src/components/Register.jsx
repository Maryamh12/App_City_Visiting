import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import ErrorMessage from './ErrorMessage'
import '../style/Auth.css'

const inputFields = [
  { label: 'Username',         name: 'userName',        type: 'text',     placeholder: 'johndoe'          },
  { label: 'Email',            name: 'email',           type: 'email',    placeholder: 'you@example.com'  },
  { label: 'Password',         name: 'password',        type: 'password', placeholder: '8+ characters'    },
  { label: 'Confirm password', name: 'confirmPassword', type: 'password', placeholder: '••••••••'         },
]

const Register = ({ setIsTransparentNav }) => {
  const [formData,     setFormData]     = useState({ userName: '', email: '', password: '', confirmPassword: '' })
  const [error,        setError]        = useState(null)
  const [loading,      setLoading]      = useState(false)
  const navigate = useNavigate()

  useEffect(() => { setIsTransparentNav(false) }, [])

  const onChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  /* Client-side validation before hitting the API */
  const validate = () => {
    if (!formData.userName.trim()) return 'Please enter a username.'
    if (!formData.email.includes('@')) return 'Please enter a valid email address.'
    if (formData.password.length < 8) return 'Password must be at least 8 characters.'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.'
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError({ message: validationError, needsLogin: false })
      return
    }
    setLoading(true)
    try {
      await api.post('/register', formData)
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message ?? ''
      // Make API messages friendlier
      if (msg.includes('already exists') || msg.includes('already registered')) {
        setError({ message: 'An account with this email already exists. Try logging in.', needsLogin: false })
      } else if (!err.response) {
        setError({ message: 'Cannot reach the server. Is the API running?', needsLogin: false })
      } else {
        setError({ message: msg || 'Registration failed. Please try again.', needsLogin: false })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page auth-page--full">
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <h1 className="auth-heading">Create account</h1>

          <form onSubmit={onSubmit} noValidate>
            {inputFields.map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="field-label" htmlFor={name}>{label}</label>
                <input
                  className="field-input"
                  id={name} type={type} name={name}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={onChange} required
                />
              </div>
            ))}

            <ErrorMessage
              message={error?.message}
              needsLogin={false}
              onDismiss={() => setError(null)}
            />

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
