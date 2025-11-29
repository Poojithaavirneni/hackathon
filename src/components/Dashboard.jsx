import React, { useEffect, useState } from 'react'
import { getAnalytics } from '../data/db'

export default function Dashboard(){
  const [analytics, setAnalytics] = useState(null)

  useEffect(()=>{
    getAnalytics().then(setAnalytics).catch(()=>setAnalytics(null))
  },[])

  return (
    <div>
      <h2>Student Dashboard</h2>
      <p>Overview of your mood trend, progress and appointments.</p>
      <section className="card">
        <h3>Personalized recommendations</h3>
        <ul>
          <li>Try a 10-minute walk after class</li>
          <li>Hydration reminder: aim for 8 cups</li>
        </ul>
      </section>

      <section className="card">
        <h3>Platform Analytics (sample)</h3>
        {analytics ? (
          <div>
            <p>Total resources: {analytics.totalResources}</p>
            <p>Appointments: {analytics.appointments}</p>
            <h4>Most viewed</h4>
            <ol>
              {analytics.mostViewed.map(m=> <li key={m.id}>{m.title} — {m.views} views</li>)}
            </ol>
          </div>
        ):<p>Loading...</p>}
      </section>
    </div>
  )
}
