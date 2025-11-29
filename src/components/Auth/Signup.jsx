import React, { useState } from 'react'
import { addUser, authUser } from '../../data/db'

export default function Signup({ onSuccess, role }){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)

  const submit = (e)=>{
    e.preventDefault(); setErr(null)
    const payload = { name, email, password }
    if(role) payload.role = role
    addUser(payload).then(()=> authUser(email, password)).then(user=> onSuccess && onSuccess(user)).catch(err=>setErr(err.message))
  }

  return (
    <div className="auth-card">
      <h3>Sign up</h3>
      <form onSubmit={submit}>
        <input placeholder="Enter full name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="Enter email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Choose password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="primary">Create account</button>
      </form>
      {err && <div className="error">{err}</div>}
    </div>
  )
}
