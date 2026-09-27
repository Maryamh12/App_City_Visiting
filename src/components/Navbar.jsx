import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../style/Navbar.css'

const Navbar = ({ isTransparentNav }) => {
  const [loggedIn,  setLoggedIn]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()

  /* Sync auth state on every route change, close mobile menu */
  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('token'))
    setMenuOpen(false)
  }, [location])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setLoggedIn(false)
    navigate('/')
  }

  const navClass = [
    'navbar',
    isTransparentNav ? 'navbar--transparent' : 'navbar--solid',
  ].join(' ')

  return (
    <header className={navClass}>
      {/* Brand — original icon + title */}
      <Link to="/" className="navbar__brand">
        <img
          src="https://cdn-icons-png.flaticon.com/128/2451/2451474.png"
          alt="CityTour logo"
        />
        <span className="navbar__title">City Tour</span>
      </Link>

      {/* Desktop nav links */}
      <nav className="navbar__links">
        <NavLinks loggedIn={loggedIn} logout={logout} />
      </nav>

      {/* Hamburger button (mobile) */}
      <button
        className={`navbar__hamburger ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className="navbar__drawer">
          <NavLinks loggedIn={loggedIn} logout={logout} />
        </nav>
      )}
    </header>
  )
}

const NavLinks = ({ loggedIn, logout }) => (
  <>
    <Link className="navbar__link" to="/">Home</Link>
    <Link className="navbar__link" to="/tourbrows">Explore</Link>
    {loggedIn ? (
      <button className="navbar__link navbar__link--logout" onClick={logout}>
        Logout
      </button>
    ) : (
      <>
        <Link className="navbar__link" to="/login">Login</Link>
        <Link className="navbar__link" to="/Register">Register</Link>
      </>
    )}
  </>
)

export default Navbar
