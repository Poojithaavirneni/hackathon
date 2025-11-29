import React, { useState, useEffect } from 'react'
import { addUser, authUserPersist as authUser } from '../../data/db'

export default function Signup({ onSuccess, role }){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [captchaQ, setCaptchaQ] = useState('')
  const [captchaA, setCaptchaA] = useState(null)
  const [captchaInput, setCaptchaInput] = useState('')

  useEffect(()=>{ generateCaptcha() }, [])

  function generateCaptcha(){
    const a = Math.floor(Math.random()*9) + 1
    const b = Math.floor(Math.random()*9) + 1
    setCaptchaQ(`${a} + ${b} = ?`)
    setCaptchaA(a + b)
    setCaptchaInput('')
  }

  const submit = (e)=>{
    e.preventDefault(); setErr(null)
    if(Number(captchaInput) !== captchaA){ setErr('Captcha incorrect — please try again.'); generateCaptcha(); return }
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
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input placeholder={captchaQ} value={captchaInput} onChange={e=>setCaptchaInput(e.target.value)} required style={{flex:1}} />
          <button type="button" className="btn ghost" onClick={generateCaptcha} style={{height:40}}>↻</button>
        </div>
        <button className="primary">Create account</button>
      </form>
      {err && <div className="error">{err}</div>}
    </div>
  )
}
