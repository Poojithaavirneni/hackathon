import React, { useState } from 'react'
import { addAppointment, getCurrentUser, recordMood } from '../data/db'

function StressTest() {
  const [score, setScore] = useState(null)
  const submit = (e) => {
    e.preventDefault()
    const form = e.target
    let s = 0
    for (let i=0;i<3;i++){ s += Number(form['q'+i].value||0) }
    setScore(s)
  }
  return (
    <div className="card">
      <h3>Stress Level Test</h3>
      <form onSubmit={submit}>
        <label>Feeling overwhelmed (0-5): <input name="q0" defaultValue={0} type="number" min="0" max="5" /></label>
        <label>Sleep quality (0-5): <input name="q1" defaultValue={0} type="number" min="0" max="5" /></label>
        <label>Energy levels (0-5): <input name="q2" defaultValue={0} type="number" min="0" max="5" /></label>
        <button>Submit</button>
      </form>
      {score !== null && <p>Your stress score: {score} (higher = more stressed)</p>}
    </div>
  )
}

export default function Mental() {
  return (
    <section>
      <h2>Mental Health & Counseling</h2>
      <p>Self-assessments, mindfulness programs and appointment booking.</p>
      <div className="grid">
        <StressTest />
        <div className="card">
          <h3>Mood Tracker</h3>
          <p>Log your mood daily to spot trends.</p>
          <div>
            <select aria-label="mood">
              <option>Happy</option>
              <option>Okay</option>
              <option>Sad</option>
              <option>Anxious</option>
            </select>
            <button>Log mood</button>
          </div>
        </div>
        <div className="card">
          <h3>Book a Counseling Session</h3>
          <BookForm />
        </div>
      </div>
    </section>
  )
}

function BookForm(){
  const [status, setStatus] = useState(null)
  const [me, setMe] = useState(null)

  React.useEffect(()=>{
    getCurrentUser().then(u=>setMe(u)).catch(()=>{})
  },[])
  const submit = (e)=>{
    e.preventDefault();
    const body = { name: e.target.name.value, email: e.target.email.value, datetime: e.target.datetime.value }
    // store appointment locally
    addAppointment(body).then(d=>setStatus('Booked (id: '+d.id+')')).catch(()=>setStatus('Error'))
  }
  return (
    <form onSubmit={submit}>
      <input name="name" placeholder="Your name" defaultValue={me && me.name} required />
      <input name="email" placeholder="email" defaultValue={me && me.email} required />
      <input name="datetime" placeholder="Preferred date/time" />
      <button>Request</button>
      {status && <p>{status}</p>}
    </form>
  )
}
