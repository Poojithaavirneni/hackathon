import React, { useState } from 'react'
import Login from './Auth/Login'
import Signup from './Auth/Signup'

export default function Entry({ onAuth, initialRole = 'student', initialTab = 'login' }){
  const [role, setRole] = useState(initialRole)
  const [tab, setTab] = useState(initialTab)

  const onSuccess = (user) => {
    onAuth && onAuth(user)
  }

  return (
    <div className="entry">
      <h2 className="entry-title">StuHealth - Student & Wellness</h2>
      <div className="entry-card">
        <div className="role-toggle">
          <button className={role==='student'? 'active':''} onClick={()=>setRole('student')}>Student</button>
          <button className={role==='admin'? 'active':''} onClick={()=>setRole('admin')}>Admin</button>
        </div>

        <div className="tabs">
          <button className={tab==='login'? 'active':''} onClick={()=>setTab('login')}>Login</button>
          <button className={tab==='signup'? 'active':''} onClick={()=>setTab('signup')}>Sign Up</button>
        </div>

        <div className="auth-area">
          {tab === 'login' ? (
            <Login role={role} onSuccess={onSuccess} />
          ) : (
            <Signup role={role} onSuccess={onSuccess} />
          )}
        </div>
      </div>
    </div>
  )
}
