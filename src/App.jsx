import React, { useState, useEffect, Suspense, lazy } from 'react'
import Home from './components/Home'
import Resources from './components/Resources'
import Mental from './components/MentalHealth'
import Dashboard from './components/Dashboard'
const Feedback = lazy(()=> import('./components/Feedback'))
const Admin = lazy(()=> import('./components/AdminPanel'))
const Profile = lazy(()=> import('./components/Profile'))
// Login and Signup are used inside Entry; no direct import needed here
import Entry from './components/Entry'
import { getResources, getCurrentUser, logout } from './data/db'

const VIEWS = { HOME: 'home', RES: 'resources', MENTAL: 'mental', DASH: 'dashboard', ADMIN: 'admin', PROFILE: 'profile', FEEDBACK: 'feedback' }

export default function App() {
  const [view, setView] = useState('entry')
  const [resourcesCount, setResourcesCount] = useState(0)
  const [user, setUser] = useState(null)
  const [resourcesFilter, setResourcesFilter] = useState('')

  useEffect(() => {
    getResources().then(d => setResourcesCount(d.length)).catch(() => {});
    getCurrentUser().then(u=>setUser(u))
  }, [])

  const onLogout = ()=>{ logout().then(()=>setUser(null)); setView(VIEWS.HOME) }

  return (
    <div className={`app ${['entry','login','signup'].includes(view) ? 'no-header' : ''}`}>
      <header className="header">
        <div className="brand-wrap">
          <h1 className="brand">StuHealth</h1>
          <div className="tag">Student Health & Wellness</div>
        </div>
        <nav>
          <button onClick={() => setView(VIEWS.HOME)}>Home</button>
          <button onClick={() => setView(VIEWS.RES)}>Resources</button>
          <button onClick={() => setView(VIEWS.MENTAL)}>Mental Health</button>
          <button onClick={() => setView(VIEWS.DASH)}>Dashboard</button>
          <button onClick={() => setView(VIEWS.FEEDBACK)}>Feedback</button>
          {user && user.role === 'admin' && (
            <button onClick={() => setView(VIEWS.ADMIN)}>Admin</button>
          )}
          {user ? (
            <>
              <span className="user" style={{cursor: 'pointer'}} onClick={() => setView(VIEWS.PROFILE)}>{user.name}</span>
              <button onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={()=>setView('login')}>Login</button>
              <button onClick={()=>setView('signup')}>Sign up</button>
            </>
          )}
        </nav>
      </header>

      <main className="main">
  {view === 'entry' && <Entry onAuth={(u)=>{ setUser(u); setView(VIEWS.HOME) }} />}
  {view === VIEWS.HOME && <Home resourcesCount={resourcesCount} open={(cat)=>{ setResourcesFilter(cat||''); setView(VIEWS.RES) }} />}
    {view === VIEWS.RES && <Resources initialFilter={resourcesFilter} />}
        {view === VIEWS.MENTAL && <Mental />}
        {view === VIEWS.DASH && <Dashboard />}
        {view === VIEWS.PROFILE && (
          user ? (
            <Suspense fallback={<div>Loading profile...</div>}>
              <Profile onUpdated={(u) => setUser(u)} onNavigate={(v)=>setView(v)} />
            </Suspense>
          ) : (
            <div style={{padding: '1rem'}}>
              <h3>Please log in</h3>
              <p>You need to be logged in to view your profile.</p>
              <button onClick={() => setView('login')}>Login</button>
            </div>
          )
        )}
        {view === VIEWS.FEEDBACK && (
          <Suspense fallback={<div>Loading feedback...</div>}>
            <Feedback />
          </Suspense>
        )}
        {view === VIEWS.ADMIN && (
          user && user.role === 'admin' ? (
            <Suspense fallback={<div>Loading admin...</div>}>
              <Admin />
            </Suspense>
          ) : (
            <div style={{padding: '1rem'}}>
              <h3>Access denied</h3>
              <p>This area is for administrators only. Please log in with an admin account.</p>
              <button onClick={() => setView('entry')}>Go to Login</button>
            </div>
          )
        )}
  {view === 'login' && (
    <Entry initialTab="login" onAuth={(u)=>{ setUser(u); setView(u.role==='admin'? VIEWS.ADMIN: VIEWS.DASH) }} />
  )}

  {view === 'signup' && (
    <Entry initialTab="signup" onAuth={(u)=>{ setUser(u); setView(u.role==='admin'? VIEWS.ADMIN: VIEWS.DASH) }} />
  )}
      </main>

      <footer className="footer">© StuHealth — Student wellbeing platform</footer>
    </div>
  )
}
