import React, { useEffect, useState } from 'react'
import { getCurrentUser, updateUser, getUserStats } from '../data/db'

export default function Profile({ onUpdated, onNavigate }){
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', routine: [] })
  const [stats, setStats] = useState({ resourcesViewed: 0, appointments: 0, recentViews: [], moodSummary: [], lastLogin: null })
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(()=>{
    getCurrentUser().then(u => {
      setUser(u)
      if(u) {
        setForm({ name: u.name||'', email: u.email||'', routine: (u.routine||[]) })
        getUserStats(u.id).then(s => setStats(s)).catch(() => {})
      }
    })
  },[])

  if(!user) return <div><h3>No profile</h3><p>Please login to view your profile.</p></div>

  function onChangeField(k, v){ setForm(prev=> ({...prev, [k]: v })) }

  function addRoutine(){ setForm(prev=> ({...prev, routine: [...prev.routine, 'New task']})) }
  function updateRoutine(i, v){ const r = [...form.routine]; r[i]=v; setForm(prev=> ({...prev, routine: r})) }
  function removeRoutine(i){ const r=[...form.routine]; r.splice(i,1); setForm(prev=> ({...prev, routine: r})) }

  function save(){
    const patch = { name: form.name, email: form.email, routine: form.routine }
    updateUser(user.id, patch).then(u=>{ setUser(u); setEditing(false); onUpdated && onUpdated(u) })
  }

  // show saved confirmation briefly
  function saveWithFeedback(){
    const patch = { name: form.name, email: form.email, routine: form.routine }
    updateUser(user.id, patch).then(u=>{ setUser(u); setEditing(false); onUpdated && onUpdated(u); setSaveMsg('Profile saved'); setTimeout(()=>setSaveMsg(''), 2500) })
  }

  return (
    <div>
      <h2>Profile</h2>
      {!editing ? (
        <section className="card">
          <div className="profile-head">
            <div className="profile-avatar">{user.name ? user.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() : 'U'}</div>
            <div className="profile-meta">
              <h3 className="profile-name">{user.name}</h3>
              <div className="profile-sub">{user.email} • <small className="role">{user.role}</small></div>
            </div>
          </div>

          <div className="profile-grid">
            <div>
              <h4>Daily routine</h4>
              {user.routine && user.routine.length ? (
                <ol>{user.routine.map((r,i)=>(<li key={i}>{r}</li>))}</ol>
              ):<p>No routine set yet.</p>}
            </div>

            <aside className="profile-aside">
              <h4 className="small-title">Quick stats</h4>
              <div className="profile-stats">
                <div><strong>{stats.resourcesViewed}</strong><div className="stat-label">Resources viewed</div></div>
                <div><strong>{stats.appointments}</strong><div className="stat-label">Appointments</div></div>
              </div>
              <h5 className="small-title">Recent views</h5>
              <ul className="recent-list">
                {stats.recentViews && stats.recentViews.length ? stats.recentViews.map(r => (
                  <li key={r.id}><span className="rv-title">{r.title}</span> <small className="rv-time">{new Date(r.when).toLocaleString()}</small></li>
                )) : <li className="muted">No recent views</li>}
              </ul>
              <div className="profile-actions">
                <button className="primary">Edit routine & actions</button>
                <button className="btn-export">Export</button>
              </div>
              <div className="profile-actions small">
                <button className="secondary">Settings</button>
                <button className="primary" onClick={()=> onNavigate ? onNavigate('mental') : null}>Book appointment</button>
              </div>
            </aside>
          </div>

          <div className="profile-edit">
            <button onClick={()=>setEditing(true)}>Edit profile</button>
          </div>
        </section>
      ) : (
        <section className="card">
          <h3>Edit profile</h3>
          <label>Name</label>
          <input value={form.name} onChange={e=>onChangeField('name', e.target.value)} />
          <label>Email</label>
          <input value={form.email} onChange={e=>onChangeField('email', e.target.value)} />

          <h4>Daily routine</h4>
          <div>
            {form.routine.map((r,i)=> (
              <div key={i} className="routine-item">
                <input value={r} onChange={e=>updateRoutine(i, e.target.value)} />
                <button onClick={()=>removeRoutine(i)}>Remove</button>
              </div>
            ))}
            <div>
              <button onClick={addRoutine}>Add task</button>
            </div>
          </div>

          <div style={{marginTop:'.8rem'}}>
            <button onClick={saveWithFeedback} className="primary">Save</button>
            <button onClick={()=>setEditing(false)} style={{marginLeft:'.6rem'}}>Cancel</button>
          </div>
          {saveMsg && <div className="save-msg">{saveMsg}</div>}
        </section>
      )}
    </div>
  )
}
