import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { API_URL } from '../consts'
import { parseApiError } from '../utils/apiError'
import ErrorMessage from './ErrorMessage'
import '../style/Tourbrows.css'

const Tourbrows = ({ setIsTransparentNav, fetchingComment, setFetchingComment }) => {
  const [cityData,     setCityData]     = useState([])
  const [stories,      setStories]      = useState([])
  const [cityIndex,    setCityIndex]    = useState(0)
  const [cityId,       setCityId]       = useState(null)
  const [storyIndex,   setStoryIndex]   = useState(0)
  const [commentPanel, setCommentPanel] = useState(null)
  const [commentInput, setCommentInput] = useState('')
  const [error,        setError]        = useState(null)  // { message, needsLogin }
  const [fetchError,   setFetchError]   = useState('')   // API-level error
  const [submitting,   setSubmitting]   = useState(false)
  const [loading,      setLoading]      = useState(true)
  const autoScrollRef = useRef(null)   // holds the auto-scroll interval

  useEffect(() => { setIsTransparentNav(false) }, [])

  /* ── Fetch all cities ─────────────────────────────────── */
  useEffect(() => {
    const storedCity = localStorage.getItem('city')
    const preselect  = storedCity ? JSON.parse(storedCity) : null

    const fetchData = async () => {
      setLoading(true)
      setFetchError('')
      try {
        const { data } = await api.get('/cats')

        if (!data || data.length === 0) {
          setFetchError('No cities found in the database. Run npm run seed-db in your API folder.')
          return
        }

        setCityData(data)

        let idx = 0
        if (preselect) {
          const found = data.findIndex(c => c._id === preselect._id)
          if (found !== -1) idx = found
          localStorage.removeItem('city')
        }

        setCityIndex(idx)
        setCityId(data[idx]._id)
        setStories(data[idx].storys)
        setStoryIndex(0)
      } catch (err) {
        // Network error or API down — show helpful message
        const isNetworkError = !err.response
        setFetchError(
          isNetworkError
            ? `Cannot reach the API at ${API_URL}. Make sure your backend is running (npm run dev in the API folder).`
            : `API error: ${err.response?.data?.message ?? err.message}`
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchingComment])

  /* ── Auto-scroll carousel (5 s interval) ─────────────── */
  const startAutoScroll = useCallback(() => {
    clearInterval(autoScrollRef.current)
    autoScrollRef.current = setInterval(() => {
      setStoryIndex(i => (i === stories.length - 1 ? 0 : i + 1))
    }, 8000)
  }, [stories.length])

  // Start auto-scroll when stories change, clear on unmount
  useEffect(() => {
    if (stories.length > 1) startAutoScroll()
    return () => clearInterval(autoScrollRef.current)
  }, [stories, startAutoScroll])

  /* ── Helpers ──────────────────────────────────────────── */
  const selectCity = (idx) => {
    setCityIndex(idx)
    setCityId(cityData[idx]._id)
    setStories(cityData[idx].storys)
    setStoryIndex(0)
    setCommentPanel(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStory = () => {
    setStoryIndex(i => (i === 0 ? stories.length - 1 : i - 1))
    startAutoScroll()   // reset timer on manual nav
  }

  const nextStory = () => {
    setStoryIndex(i => (i === stories.length - 1 ? 0 : i + 1))
    startAutoScroll()
  }

  const openComments = (story) => {
    setCommentPanel(story)
    setCommentInput('')
    setError(null)
  }

  const closeComments = () => {
    setCommentPanel(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Post comment ─────────────────────────────────────── */
  const submitComment = async (e) => {
    e.preventDefault()
    if (!commentInput.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/comment/${cityId}/${commentPanel._id}`, {
        text: commentInput,
      })
      setCommentInput('')
      setFetchingComment(v => !v)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Toggle like ──────────────────────────────────────── */
  const handleLike = async (storyId) => {
    setError(null)
    try {
      await api.post(`/story/${storyId}/like`)
      setFetchingComment(v => !v)
    } catch (err) {
      setError(parseApiError(err))
    }
  }

  /* ── Save context before navigating ──────────────────── */
  const saveStoryContext = () => {
    localStorage.setItem('city',  JSON.stringify(cityData[cityIndex]))
    localStorage.setItem('story', JSON.stringify(stories[storyIndex]))
  }

  const saveCreateContext = (cityIdx) => {
    localStorage.setItem('city', JSON.stringify(cityData[cityIdx]))
  }

  /* ── Loading state ────────────────────────────────────── */
  if (loading) {
    return (
      <div className="tb-status-screen">
        <div className="tb-spinner" />
        <p className="tb-status-text">Loading cities…</p>
      </div>
    )
  }

  /* ── API error state ──────────────────────────────────── */
  if (fetchError) {
    return (
      <div className="tb-status-screen">
        <div className="tb-error-card">
          <span className="tb-error-icon">⚠</span>
          <h2 className="tb-error-title">Could not load cities</h2>
          <p className="tb-error-msg">{fetchError}</p>
          <div className="tb-error-steps">
            <p className="tb-error-step"><span>1</span> Open a terminal in your <code>Citytour-Api-redesigned</code> folder</p>
            <p className="tb-error-step"><span>2</span> Run <code>npm run dev</code></p>
            <p className="tb-error-step"><span>3</span> Make sure <code>src/consts.jsx</code> says <code>http://localhost:4000</code></p>
            <p className="tb-error-step"><span>4</span> Refresh this page</p>
          </div>
          <button
            className="tb-error-retry"
            onClick={() => setFetchingComment(v => !v)}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const activeStory = stories[storyIndex]

  return (
    <div className="tb-page">

      {/* ── Featured story carousel ───────────────────────── */}
      {!commentPanel && activeStory && (
        <section style={{ position: 'relative' }}>
          <div className="tb-feature">
            <img
              className="tb-feature__img"
              src={activeStory.image}
              alt={activeStory.name}
            />

            {stories.length > 1 && (
              <>
                <button className="tb-arrow tb-arrow--left" onClick={prevStory} aria-label="Previous story">
                  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="tb-arrow tb-arrow--right" onClick={nextStory} aria-label="Next story">
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </>
            )}

            <div className="tb-feature__info">
              <div>
                <h2 className="tb-feature__name">{activeStory.name}</h2>
                <p className="tb-feature__desc">{activeStory.description}</p>
              </div>
              <div className="tb-feature__actions">
                <button
                  className="tb-icon-btn"
                  onClick={() => openComments(activeStory)}
                  title="Comments"
                >
                  <img src="https://cdn-icons-png.flaticon.com/128/3690/3690710.png" alt="Comments" />
                </button>
                <Link to={`/story/${cityId}/${activeStory._id}`} onClick={saveStoryContext}>
                  <button className="tb-icon-btn" title="Edit story">
                    <img src="https://cdn-icons-png.flaticon.com/128/7073/7073677.png" alt="Edit" />
                  </button>
                </Link>
                <button
                  className="tb-like-btn"
                  onClick={() => handleLike(activeStory._id)}
                  title="Like"
                >
                  <ion-icon name="heart" />
                  <span>{activeStory.likes?.length ?? 0}</span>
                </button>
                <ErrorMessage message={error?.message} needsLogin={error?.needsLogin} onDismiss={() => setError(null)} />
              </div>
            </div>

            {stories.length > 1 && (
              <div className="tb-dots">
                {stories.map((_, i) => (
                  <button
                    key={i}
                    className={`tb-dot ${i === storyIndex ? 'tb-dot--active' : ''}`}
                    onClick={() => { setStoryIndex(i); startAutoScroll() }}
                    aria-label={`Story ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Comment panel ─────────────────────────────────── */}
      {commentPanel && (
        <div className="tb-comments-overlay">
          <div className="tb-comments__header">
            <h2 className="tb-comments__title">💬 {commentPanel.name} — Comments</h2>
            <button className="tb-comments__close" onClick={closeComments}>✕ Close</button>
          </div>
          <div className="tb-comments__list">
            {!commentPanel.comments?.length && (
              <p className="tb-comments__empty">No comments yet. Be the first!</p>
            )}
            {commentPanel.comments?.map((c, i) => (
              <div key={i} className="tb-comment-item">
                <div className="tb-comment-avatar">{c.text?.[0]?.toUpperCase() ?? '?'}</div>
                <p className="tb-comment-text">{c.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={submitComment}>
            <label style={{ display:'block', marginBottom:8, fontFamily:'Anta', fontSize:'0.85rem', color:'var(--smoke)' }}>
              Enter your comment:
            </label>
            <textarea
              className="tb-comments__textarea"
              placeholder="Share your thoughts…"
              value={commentInput}
              onChange={e => { setCommentInput(e.target.value); setError(null) }}
              rows={4}
            />
            <ErrorMessage message={error?.message} needsLogin={error?.needsLogin} onDismiss={() => setError(null)} />
            <div className="tb-comments__form-btns">
              <button type="submit" className="tb-btn tb-btn--dark" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post comment'}
              </button>
              <button type="button" className="tb-btn tb-btn--white" onClick={closeComments}>
                Close
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── City cards grid ───────────────────────────────── */}
      <div className="tb-cities">
        <h2 className="tb-cities__heading">Explore Cities</h2>
        <div className="tb-grid">
          {cityData.map((city, idx) => (
            <article
              key={city._id}
              className={`tb-card ${idx === cityIndex ? 'tb-card--active' : ''}`}
            >
              <div className="tb-card__img-wrap">
                <img className="tb-card__img" src={city.image} alt={city.name} />
              </div>
              <div className="tb-card__body">
                <h3 className="tb-card__name">{city.name}</h3>
                <p className="tb-card__text">{city.text}</p>
                <div className="tb-card__footer">
                  <button className="tb-btn tb-btn--white" onClick={() => selectCity(idx)}>
                    Show me
                  </button>
                  <Link to={`/createstory/${city._id}`} onClick={() => saveCreateContext(idx)}>
                    <button className="tb-btn tb-btn--dark">Create Story</button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Tourbrows
