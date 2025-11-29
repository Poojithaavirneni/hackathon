import React, { useState, useEffect } from 'react'
import { getCurrentUser } from '../data/db'
import * as api from '../api'

export default function Feedback(){
  const [form, setForm] = useState({ name:'', email:'', rating:5, message: '' })
  const [status, setStatus] = useState(null)

  useEffect(()=>{
    getCurrentUser().then(u=>{
      if(u) setForm(prev=>({ ...prev, name: u.name||prev.name, email: u.email||prev.email }))
    }).catch(()=>{})
  },[])

  function onChange(k, v){ setForm(prev=> ({ ...prev, [k]: v })) }

  function submit(e){
    e.preventDefault()
    setStatus('sending')
    api.addFeedback({ name: form.name, email: form.email, rating: Number(form.rating), message: form.message }).then(()=>{
      setStatus('thanks')
      setForm({ name: form.name, email: form.email, rating:5, message: '' })
      setTimeout(()=> setStatus(null), 3000)
    }).catch(()=> setStatus('error'))
  }

  return (
    <div>
      <h2>Feedback</h2>
      <p>Help us improve StuHealth — your feedback is anonymous unless you provide contact details.</p>
      <section className="card" style={{maxWidth:720}}>
        <form onSubmit={submit} className="feedback-form">
          <label>Name</label>
          <input value={form.name} onChange={e=>onChange('name', e.target.value)} placeholder="Your name (optional)" />

          <label>Email</label>
          <input value={form.email} onChange={e=>onChange('email', e.target.value)} placeholder="Email (optional)" />

          <label>Rating</label>
          <select value={form.rating} onChange={e=>onChange('rating', e.target.value)}>
            <option value={5}>5 — Excellent</option>
            <option value={4}>4 — Good</option>
            <option value={3}>3 — Okay</option>
            <option value={2}>2 — Poor</option>
            <option value={1}>1 — Terrible</option>
          </select>

          <label>Message</label>
          <textarea value={form.message} onChange={e=>onChange('message', e.target.value)} placeholder="How can we make StuHealth better?" />

          <div style={{marginTop:8}}>
            <button className="primary">Send feedback</button>
            {status === 'sending' && <span style={{marginLeft:8}}>Sending…</span>}
            {status === 'thanks' && <span style={{marginLeft:8, color:'#0a7'}}>Thanks — feedback sent</span>}
            {status === 'error' && <span style={{marginLeft:8, color:'#b00'}}>Error sending</span>}
          </div>
        </form>
      </section>
    </div>
  )
}
