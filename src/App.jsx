import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar      from './components/Navbar'
import Footer      from './components/Footer'
import Main        from './components/Main'
import Login       from './components/Login'
import Register    from './components/Register'
import Tourbrows   from './components/Tourbrows'
import CreatStory  from './components/CreatStory'
import UpdateStory from './components/UpdateStory'

// Exact routes and path prefixes where the footer should NOT appear
const NO_FOOTER_EXACT    = ['/login', '/Register']
const NO_FOOTER_PREFIXES = ['/createstory/', '/story/']

function App() {
  const [isTransparentNav, setIsTransparentNav] = useState(false)
  const [fetchingComment,  setFetchingComment]  = useState(false)
  const location = useLocation()

  const showFooter =
    !NO_FOOTER_EXACT.includes(location.pathname) &&
    !NO_FOOTER_PREFIXES.some(prefix => location.pathname.startsWith(prefix))

  return (
    <div className="app-shell">
      <Navbar isTransparentNav={isTransparentNav} />

      <main className="page-content">
        <Routes>
          <Route path="/"
            element={<Main setIsTransparentNav={setIsTransparentNav} />} />
          <Route path="/login"
            element={<Login setIsTransparentNav={setIsTransparentNav} />} />
          <Route path="/Register"
            element={<Register setIsTransparentNav={setIsTransparentNav} />} />
          <Route path="/tourbrows"
            element={
              <Tourbrows
                setIsTransparentNav={setIsTransparentNav}
                fetchingComment={fetchingComment}
                setFetchingComment={setFetchingComment}
              />
            }
          />
          <Route path="/createstory/:id"
            element={
              <CreatStory
                setIsTransparentNav={setIsTransparentNav}
                fetchingComment={fetchingComment}
                setFetchingComment={setFetchingComment}
              />
            }
          />
          <Route path="/story/:cityId/:storyId"
            element={
              <UpdateStory
                setIsTransparentNav={setIsTransparentNav}
                fetchingComment={fetchingComment}
                setFetchingComment={setFetchingComment}
              />
            }
          />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  )
}

export default App
