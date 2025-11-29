import React, { useEffect, useState } from 'react'
import { getAnalytics, getUsers, getAppointments, updateAppointmentStatus, getResources, addResource, deleteAppointment, getResource, updateResource, deleteResource, getFeedbacks, deleteFeedback } from '../data/db'
import * as api from '../api'

export default function AdminPanel(){
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [appts, setAppts] = useState([])
  const [resources, setResources] = useState([])
  const [title, setTitle] = useState('')
  const [editingRes, setEditingRes] = useState(null)
  const [resForm, setResForm] = useState({ title:'', category:'General', type:'article', content:'', url:'' })
  const [feedbacks, setFeedbacks] = useState([])

  useEffect(()=>{
    loadAll()
  },[])

  function loadAll(){
    // use API shim so admin can work with a backend if available
    api.getAnalytics().then(setAnalytics).catch(()=>{})
    api.getUsers().then(setUsers).catch(()=>{})
    api.getAppointments().then(setAppts).catch(()=>{})
    api.getResources().then(setResources).catch(()=>{})
    api.getFeedbacks().then(setFeedbacks).catch(()=>{})
  }

  const createResource = (e)=>{
    e.preventDefault();
    const body = { title, category: 'General', type: 'article', content: 'Admin uploaded.' }
    api.addResource(body).then(()=>{ setTitle(''); loadAll() })
  }

  const startEdit = (id)=>{
    api.getResources().then(()=>{})
    getResource(id).then(r=>{
      setEditingRes(id)
      setResForm({ title: r.title||'', category: r.category||'General', type: r.type||'article', content: r.content||'', url: r.url||'' })
    }).catch(()=>{})
  }

  const saveResource = (e)=>{
    e.preventDefault()
    if(!editingRes) return
    api.updateResource(editingRes, resForm).then(()=>{ setEditingRes(null); setResForm({ title:'', category:'General', type:'article', content:'', url:'' }); loadAll() }).catch(()=>{})
  }

  const removeResource = (id)=>{
    if(!confirm('Delete resource?')) return
    api.deleteResource(id).then(()=> loadAll()).catch(()=>deleteResource(id).then(()=>loadAll()).catch(()=>alert('Delete failed')))
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
        <h3>Feedback</h3>
        {feedbacks.length ? (
          <ul>
            {feedbacks.map(f=> (
              <li key={f.id} style={{marginBottom:'.6rem'}}>
                <div><strong>{f.name||'Anonymous'}</strong> <small style={{color:'#666'}}>{f.email||''} • {new Date(f.created).toLocaleString()}</small></div>
                <div style={{marginTop:4}}>{f.message}</div>
                <div style={{marginTop:4}}><button onClick={()=>{ if(confirm('Delete feedback?')) api.deleteFeedback(f.id).then(()=>loadAll()).catch(()=>deleteFeedback(f.id).then(()=>loadAll()).catch(()=>alert('Delete failed'))) }}>Delete</button></div>
              </li>
            ))}
          </ul>
        ) : <p>No feedback yet.</p>}
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
        <h4 style={{marginTop:'.8rem'}}>All resources</h4>
        <ul>
          {resources.map(r=> (
            <li key={r.id} style={{marginBottom:'.4rem'}}>
              <strong>{r.title}</strong> <small style={{color:'#666'}}>{r.category} • {r.type}</small>
              <div style={{marginTop:'.3rem'}}>
                <button onClick={()=>startEdit(r.id)}>Edit</button>
                <button style={{marginLeft:6}} onClick={()=>removeResource(r.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
        {editingRes && (
          <form onSubmit={saveResource} style={{marginTop:'.6rem', display:'grid', gap:'.5rem'}}>
            <input value={resForm.title} onChange={e=>setResForm(prev=>({...prev, title:e.target.value}))} placeholder="Title" required />
            <input value={resForm.category} onChange={e=>setResForm(prev=>({...prev, category:e.target.value}))} placeholder="Category" />
            <select value={resForm.type} onChange={e=>setResForm(prev=>({...prev, type:e.target.value}))}>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
            <input value={resForm.url} onChange={e=>setResForm(prev=>({...prev, url:e.target.value}))} placeholder="URL (optional)" />
            <textarea value={resForm.content} onChange={e=>setResForm(prev=>({...prev, content:e.target.value}))} placeholder="Content" />
            <div>
              <button type="submit">Save</button>
              <button type="button" onClick={()=>{ setEditingRes(null); setResForm({ title:'', category:'General', type:'article', content:'', url:'' }) }} style={{marginLeft:6}}>Cancel</button>
            </div>
          </form>
        )}
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
                  <button style={{marginLeft:6}} onClick={()=>{ if(confirm('Delete appointment?')) api.deleteAppointment(a.id).then(()=>loadAll()).catch(()=>deleteAppointment(a.id).then(()=>loadAll()).catch(()=>alert('Delete failed'))) }}>Delete</button>
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
