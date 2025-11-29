import React, { useState } from 'react'
import { authUser } from '../../data/db'

export default function Login({ onSuccess, role }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)

  const submit = (e)=>{
    e.preventDefault(); setErr(null)
    authUser(email, password).then(user=>{
      if(role && user.role !== role){
        setErr('Invalid role for this login.');
        return;
      }
      onSuccess && onSuccess(user)
    }).catch(err=>setErr(err.message))
  }

  return (
    <div className="auth-card">
      <h3>Login</h3>
      <form onSubmit={submit}>
        <input placeholder="Enter email or username" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Enter password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="primary">Login</button>
      </form>
      {err && <div className="error">{err}</div>}
    </div>
  )
}
