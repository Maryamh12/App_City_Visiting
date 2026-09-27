import { Link } from 'react-router-dom'
import './ErrorMessage.css'

/**
 * Shared error message component used across all pages.
 * Shows a login link when needsLogin is true.
 */
const ErrorMessage = ({ message, needsLogin = false, onDismiss }) => {
  if (!message) return null

  return (
    <div className="err-box" role="alert">
      <span className="err-icon">!</span>
      <span className="err-text">
        {message}
        {needsLogin && (
          <>
            {' '}
            <Link to="/login" className="err-login-link">Sign in →</Link>
          </>
        )}
      </span>
      {onDismiss && (
        <button className="err-dismiss" onClick={onDismiss} aria-label="Dismiss">✕</button>
      )}
    </div>
  )
}

export default ErrorMessage
