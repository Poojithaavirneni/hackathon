import React from 'react'
import Hero from '../assets/hero.svg'
import Yoga from '../assets/yoga.svg'
import Nutrition from '../assets/nutrition.svg'

export default function Home({ resourcesCount, open }) {
  return (
    <section>
      <div className="hero-wrap">
        <div className="hero-art"><img src={Hero} alt="hero" /></div>
        <div className="hero-ct">
          <h2>How can we help you today?</h2>
          <p>Access mental health resources, fitness programs, and nutrition guides curated for students.</p>
          <div className="quick-actions">
            <button onClick={open}>Explore Resources ({resourcesCount})</button>
            <button>Book Counseling</button>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card feature" onClick={()=>open('Mindfulness')} style={{cursor:'pointer'}}>
          <img src={Yoga} alt="yoga" />
          <h3>Mood Tracker</h3>
          <p>Track your mood and get personalized tips.</p>
        </div>
        <div className="card feature" onClick={()=>open('Fitness')} style={{cursor:'pointer'}}>
          <img src={Yoga} alt="fitness" />
          <h3>Weekly Fitness</h3>
          <p>Join weekly challenges and improve fitness with peers.</p>
        </div>
        <div className="card feature" onClick={()=>open('Nutrition')} style={{cursor:'pointer'}}>
          <img src={Nutrition} alt="nutrition" />
          <h3>Nutrition</h3>
          <p>Student-friendly diet plans and recipes.</p>
        </div>
      </div>
    </section>
  )
}
