import React, { useState, useEffect } from 'react'
import { authUserPersist as authUser } from '../../data/db'

export default function Login({ onSuccess, role }){
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
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input placeholder={captchaQ} value={captchaInput} onChange={e=>setCaptchaInput(e.target.value)} required style={{flex:1}} />
          <button type="button" className="btn ghost" onClick={generateCaptcha} style={{height:40}}>↻</button>
        </div>
        <button className="primary">Login</button>
      </form>
      {err && <div className="error">{err}</div>}
    </div>
  )
}
