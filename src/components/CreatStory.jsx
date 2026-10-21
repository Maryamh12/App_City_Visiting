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

const CreatStory = ({ setIsTransparentNav, fetchingComment, setFetchingComment }) => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData,     setFormData]     = useState({ name: '', description: '', image: null })
  const [previewImage, setPreviewImage] = useState(null)
  const [error,        setError]        = useState(null)   // { message, needsLogin }
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
      await api.post(`/story/${id}`, formData)
      setFetchingComment(v => !v)
      navigate('/tourbrows')
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="story-page">
      <div className="story-media">
        <img
          src="https://images.pexels.com/photos/3331837/pexels-photo-3331837.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="City"
        />
      </div>

      <div className="story-form-wrap">
        <button className="story-back-btn" onClick={() => navigate('/tourbrows')} type="button">
          <BackArrow /> Back to Explore
        </button>

        <h1 className="story-heading">Create your story</h1>

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
                Click to upload a photo
              </span>
            )}
            <span className="story-upload__hover">Change photo</span>
          </button>

          <label className="story-field-label" htmlFor="name">Story title</label>
          <input
            className="story-field-input"
            id="name" type="text" name="name"
            placeholder="Name your story"
            onChange={onChange} required
          />

          <label className="story-field-label" htmlFor="description">Description</label>
          <textarea
            className="story-field-input story-textarea"
            id="description" name="description"
            placeholder="Tell us what happened…"
            onChange={onChange} rows={4} required
          />

          <ErrorMessage
            message={error?.message}
            needsLogin={error?.needsLogin}
            onDismiss={() => setError(null)}
          />

          <button className="story-submit" type="submit" disabled={loading}>
            {loading ? 'Publishing…' : 'Create your story'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreatStory
