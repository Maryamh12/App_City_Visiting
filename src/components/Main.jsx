import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../consts'
import '../style/Main.css'

const Main = ({ setIsTransparentNav }) => {
  const [query,        setQuery]        = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading,      setLoading]      = useState(false)
  const navigate = useNavigate()

  /* Navbar is transparent over video hero */
  useEffect(() => { setIsTransparentNav(true) }, [])

  const handleSearch = async () => {
    if (!query.trim()) {
      setErrorMessage('Please enter the name of your city')
      return
    }
    setLoading(true)
    setErrorMessage('')
    try {
      const { data } = await axios.post(`${API_URL}/search/`, { query })
      if (data.data[0]) {
        localStorage.setItem('city', JSON.stringify(data.data[0]))
        navigate('/tourbrows')
      } else {
        setErrorMessage(data.message)
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="hero">
      {/* Background video */}
      <video
        className="hero__video"
        src="https://videos.pexels.com/video-files/5941316/5941316-sd_640_360_30fps.mp4"
        autoPlay muted loop playsInline
      />
      <div className="hero__overlay" />

      {/* Right-side welcome story box */}
      <div className="hero__content">
        <div className="hero__story">
          <h2>Welcome</h2>
          <p>
            Once upon a time, nestled between rolling hills and shimmering
            rivers, there existed a city like no other. Welcome to our
            enchanting realm, where history whispers through cobblestone
            streets and each corner holds a tale waiting to be discovered!
          </p>
        </div>
      </div>

      {/* Search bar pinned near bottom */}
      <div className="hero__search-wrap">
        <div className="hero__search">
          <input
            className="hero__input"
            type="text"
            value={query}
            placeholder="The name of your city"
            onChange={e => { setQuery(e.target.value); setErrorMessage('') }}
            onKeyDown={handleKeyDown}
            aria-label="City search"
          />
          <button
            className="hero__btn"
            onClick={handleSearch}
            disabled={loading}
            aria-label="Search"
          >
            {loading
              ? <span style={{ color: '#353535', fontWeight: 700 }}>…</span>
              : <img
                  src="https://cdn-icons-png.flaticon.com/128/3031/3031293.png"
                  alt="Search"
                />
            }
          </button>
        </div>
        {errorMessage && (
          <span className="hero__error" role="alert">{errorMessage}</span>
        )}
      </div>
    </div>
  )
}

export default Main
