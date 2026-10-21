import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../consts'
import { parseApiError } from '../utils/apiError'
import ErrorMessage from './ErrorMessage'
import '../style/StoryForm.css'

const BackArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const UpdateStory = ({ setIsTransparentNav, fetchingComment, setFetchingComment }) => {
  const { cityId, storyId } = useParams()
  const navigate = useNavigate()

  const storedStory   = localStorage.getItem('story')
  const existingStory = storedStory ? JSON.parse(storedStory) : null

  const [formData, setFormData] = useState({
    name:        existingStory?.name        ?? '',
    description: existingStory?.description ?? '',
    image:       existingStory?.image       ?? null,
  })
  const [previewImage, setPreviewImage] = useState(existingStory?.image ?? null)
  const [error,        setError]        = useState(null)
  const [loading,      setLoading]      = useState(false)
  const widgetRef = useRef(null)

  useEffect(() => { setIsTransparentNav(false) }, [])

  /* ── Cloudinary upload widget ─────────────────────────── */
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    script.async = true
    script.onload = () => {
      widgetRef.current = window.cloudinary.createUploadWidget(
        { cloudName: CLOUDINARY_CLOUD_NAME, uploadPreset: CLOUDINARY_UPLOAD_PRESET },
        (err, result) => {
          if (!err && result?.event === 'success') {
            const url = result.info.secure_url   // https, avoids mixed-content warnings
            setPreviewImage(url)
            setFormData(prev => ({ ...prev, image: url }))
          }
        }
      )
    }
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

  const openUploader = () => widgetRef.current?.open()

  const onChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.patch(`/story/${cityId}/${storyId}`, formData)
      setFetchingComment(v => !v)
      navigate('/tourbrows')
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="story-page story-page--update">
      <video
        className="story-bg-video"
        src="https://videos.pexels.com/video-files/854141/854141-sd_640_360_25fps.mp4"
        autoPlay muted loop playsInline
      />
      <div className="story-bg-overlay" />

      <div className="story-form-card">
        <button className="story-back-btn" onClick={() => navigate('/tourbrows')} type="button">
          <BackArrow /> Back to Explore
        </button>

        <h1 className="story-heading">Update your story</h1>

        <form onSubmit={onSubmit} noValidate>
          <button
            type="button"
            className="story-upload"
            onClick={openUploader}
            style={previewImage ? { backgroundImage: `url(${previewImage})` } : {}}
          >
            {!previewImage && (
              <span className="story-upload__hint">
                <span className="story-upload__icon">📷</span>
                Click to change photo
              </span>
            )}
            <span className="story-upload__hover">Change photo</span>
          </button>

          <label className="story-field-label" htmlFor="name">Story title</label>
          <input
            className="story-field-input"
            id="name" type="text" name="name"
            value={formData.name}
            onChange={onChange} required
          />

          <label className="story-field-label" htmlFor="description">Description</label>
          <textarea
            className="story-field-input story-textarea"
            id="description" name="description"
            value={formData.description}
            onChange={onChange} rows={4} required
          />

          <ErrorMessage
            message={error?.message}
            needsLogin={error?.needsLogin}
            onDismiss={() => setError(null)}
          />

          <button className="story-submit" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Update your story'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdateStory
