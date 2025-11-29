import React, { useEffect, useState } from 'react'
import { getAnalytics, getUsers, getAppointments, updateAppointmentStatus, getResources, addResource } from '../data/db'

export default function AdminPanel(){
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [appts, setAppts] = useState([])
  const [resources, setResources] = useState([])
  const [title, setTitle] = useState('')

  useEffect(()=>{
    loadAll()
  },[])

  function loadAll(){
    getAnalytics().then(setAnalytics).catch(()=>{})
    getUsers().then(setUsers).catch(()=>{})
    getAppointments().then(setAppts).catch(()=>{})
    getResources().then(setResources).catch(()=>{})
  }

  const createResource = (e)=>{
    e.preventDefault();
    const body = { title, category: 'General', type: 'article', content: 'Admin uploaded.' }
    addResource(body).then(()=>{ setTitle(''); loadAll() })
  }

  const setStatus = (id, status)=>{
    updateAppointmentStatus(id, status).then(()=> loadAll()).catch(()=>{})
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <section className="card">
        <h3>Quick Stats</h3>
        {analytics ? (
          <div style={{display:'flex', gap: '1rem'}}>
            <div className="card" style={{padding:'0.8rem'}}>
              <strong>{analytics.totalResources}</strong>
              <div>Resources</div>
            </div>
            <div className="card" style={{padding:'0.8rem'}}>
              <strong>{analytics.appointments}</strong>
              <div>Appointments</div>
            </div>
          </div>
        ):<p>Loading...</p>}
      </section>

      <section className="card" style={{marginTop:'1rem'}}>
        <h3>Create Resource</h3>
        <form onSubmit={createResource} style={{display:'flex', gap:'.5rem', alignItems:'center'}}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required />
          <button>Create</button>
        </form>
      </section>

      <section className="card" style={{marginTop:'1rem'}}>
        <h3>Most viewed resources</h3>
        <ol>
          {(analytics && analytics.mostViewed.length) ? analytics.mostViewed.map(m=> <li key={m.id}>{m.title} — {m.views} views</li>) : <li>No data</li>}
        </ol>
      </section>

      <section className="card" style={{marginTop:'1rem'}}>
        <h3>Appointments</h3>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Datetime</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {appts.map(a=> (
              <tr key={a.id} style={{borderTop:'1px solid #eef'}}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>{a.datetime}</td>
                <td>{a.status}</td>
                <td>
                  {a.status !== 'accepted' && <button onClick={()=>setStatus(a.id,'accepted')}>Accept</button>}
                  {a.status !== 'declined' && <button onClick={()=>setStatus(a.id,'declined')}>Decline</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" style={{marginTop:'1rem'}}>
        <h3>Users</h3>
        <ul>
          {users.map(u=> <li key={u.id}>{u.name} — {u.email} — {u.role}</li>)}
        </ul>
      </section>
    </div>
  )
}
