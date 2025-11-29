const STORAGE_KEY = 'stuhealth_db_v1'
// persistent session key to avoid accidental frontend session expiry
const PERSIST_KEY = 'stuhealth_persist_user'

const DEFAULT = {
  resources: [
    { id: 1, title: 'Sleep Hygiene for Students', category: 'Sleep', type: 'article', content: 'Practical tips for improving sleep...', views: 5 },
    { id: 2, title: 'Managing Anxiety: A Guide', category: 'Anxiety', type: 'article', content: 'Self-help techniques for anxiety...', views: 3 },
    { id: 3, title: '10-minute Morning Yoga', category: 'Fitness', type: 'video', url: 'https://www.youtube.com/watch?v=v7AYKMP6rOE', views: 8 },
    { id: 4, title: 'Guided Breathing Exercise (5 min)', category: 'Mindfulness', type: 'video', url: 'https://www.youtube.com/watch?v=odADwWzHR24', views: 12 },
    { id: 5, title: '20-minute Gentle Yoga for Beginners', category: 'Fitness', type: 'video', url: 'https://www.youtube.com/watch?v=4pKly2JojMw', views: 6 },
    { id: 6, title: '15-minute Guided Meditation for Sleep', category: 'Mindfulness', type: 'video', url: 'https://www.youtube.com/watch?v=ZToicYcHIOU', views: 9 },
    { id: 7, title: 'Desk Stretches (Quick Relief)', category: 'Fitness', type: 'video', url: 'https://www.youtube.com/watch?v=2L2lnxIcNmo', views: 4 },
    { id: 8, title: 'Easy Student Meals & Meal Prep', category: 'Nutrition', type: 'article', content: 'Simple, budget-friendly meal ideas and weekly prep tips for students.', views: 2 }
  ],
  feedbacks: [],
  appointments: [],
  users: [
    { id: 1, name: 'Student One', email: 'student@example.com', password: 'password', role: 'student', viewedResources: [], moodHistory: [], lastLogin: null, routine: [] },
    { id: 2, name: 'Admin', email: 'admin@example.com', password: 'adminpass', role: 'admin', viewedResources: [], moodHistory: [], lastLogin: null, routine: [] }
  ],
  session: { userId: null }
}

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(!raw) return JSON.parse(JSON.stringify(DEFAULT))
    return JSON.parse(raw)
  }catch(e){ return JSON.parse(JSON.stringify(DEFAULT)) }
}

function save(db){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function getResources(){
  return Promise.resolve(load().resources)
}

export function addResource(payload){
  const db = load()
  const nextId = db.resources.length ? Math.max(...db.resources.map(r=>r.id))+1 : 1
  const item = Object.assign({ id: nextId, views: 0 }, payload)
  db.resources.push(item)
  save(db)
  return Promise.resolve(item)
}

export function getResource(id){
  const db = load()
  const r = (db.resources||[]).find(x=>x.id === Number(id)) || null
  return Promise.resolve(r)
}

export function updateResource(id, patch){
  const db = load()
  const r = (db.resources||[]).find(x=>x.id === Number(id))
  if(!r) return Promise.reject(new Error('Resource not found'))
  Object.assign(r, patch)
  save(db)
  return Promise.resolve(r)
}

export function deleteResource(id){
  const db = load()
  const idx = (db.resources||[]).findIndex(x=>x.id === Number(id))
  if(idx === -1) return Promise.reject(new Error('Not found'))
  const removed = db.resources.splice(idx,1)[0]
  save(db)
  return Promise.resolve(removed)
}

export function incrementView(id){
  const db = load()
  const r = db.resources.find(x=>x.id === Number(id))
  if(r){ r.views = (r.views||0) + 1; save(db) }
  // also record that the current session user viewed this resource
  try{
    const uid = db.session && db.session.userId
    if(uid){
      const u = (db.users||[]).find(x=>x.id === uid)
      if(u){
        u.viewedResources = u.viewedResources || []
        u.viewedResources.push({ id: r.id, when: Date.now() })
        save(db)
      }
    }
  }catch(e){/* ignore */}
  return Promise.resolve(r)
}

export function getAppointments(){
  return Promise.resolve(load().appointments)
}

export function addAppointment(payload){
  const db = load()
  const nextId = db.appointments.length ? Math.max(...db.appointments.map(a=>a.id))+1 : 1
  // if there's a logged-in user, attach their id
  const uid = db.session && db.session.userId
  const appt = Object.assign({ id: nextId, status: 'pending', userId: uid || payload.userId || null }, payload)
  db.appointments.push(appt)
  save(db)
  return Promise.resolve(appt)
}

export function deleteAppointment(id){
  const db = load()
  const idx = (db.appointments||[]).findIndex(x=>x.id === Number(id))
  if(idx === -1) return Promise.reject(new Error('Not found'))
  const removed = db.appointments.splice(idx,1)[0]
  save(db)
  return Promise.resolve(removed)
}

export function getAnalytics(){
  const db = load()
  const mostViewed = (db.resources||[]).map(r=>({ id: r.id, title: r.title, views: r.views||0 })).sort((a,b)=>b.views-a.views).slice(0,10)
  return Promise.resolve({ mostViewed, totalResources: (db.resources||[]).length, appointments: (db.appointments||[]).length })
}

// --- Feedback ---
export function addFeedback(payload){
  const db = load()
  const nextId = db.feedbacks && db.feedbacks.length ? Math.max(...db.feedbacks.map(f=>f.id))+1 : 1
  const entry = Object.assign({ id: nextId, created: Date.now() }, payload)
  db.feedbacks = db.feedbacks || []
  db.feedbacks.push(entry)
  save(db)
  return Promise.resolve(entry)
}

export function getFeedbacks(){
  const db = load()
  return Promise.resolve(db.feedbacks || [])
}

export function deleteFeedback(id){
  const db = load()
  db.feedbacks = db.feedbacks || []
  const idx = db.feedbacks.findIndex(x=>x.id === Number(id))
  if(idx === -1) return Promise.reject(new Error('Not found'))
  const removed = db.feedbacks.splice(idx,1)[0]
  save(db)
  return Promise.resolve(removed)
}

// convenience: reset to defaults
export function resetData(){ save(JSON.parse(JSON.stringify(DEFAULT))) }

// --- Users & Auth ---
export function addUser(payload){
  const db = load()
  const nextId = db.users.length ? Math.max(...db.users.map(u=>u.id))+1 : 1
  const user = Object.assign({ id: nextId, role: 'student' }, payload)
  db.users.push(user)
  save(db)
  return Promise.resolve(user)
}

export function authUser(email, password){
  const db = load()
  const user = (db.users||[]).find(u => u.email === email && u.password === password)
  if(user){ db.session.userId = user.id; user.lastLogin = Date.now(); save(db); return Promise.resolve(user) }
  return Promise.reject(new Error('Invalid credentials'))
}

// make login persist across browser sessions to remove frontend "time limit" behavior
export function authUserPersist(email, password){
  return authUser(email, password).then(user=>{
    try{ localStorage.setItem(PERSIST_KEY, String(user.id)) }catch(e){}
    return user
  })
}

// record last login when authUser is used elsewhere; expose a helper to set lastLogin
export function setLastLogin(userId){
  const db = load()
  const u = (db.users||[]).find(x=>x.id === Number(userId))
  if(!u) return Promise.reject(new Error('User not found'))
  u.lastLogin = Date.now()
  save(db)
  return Promise.resolve(u)
}

// record a mood entry for a user
export function recordMood(userId, mood){
  const db = load()
  const u = (db.users||[]).find(x=>x.id === Number(userId))
  if(!u) return Promise.reject(new Error('User not found'))
  u.moodHistory = u.moodHistory || []
  u.moodHistory.push({ mood, when: Date.now() })
  save(db)
  return Promise.resolve(u)
}

// return user-specific stats (resources viewed, appointments booked, mood summary)
export function getUserStats(userId){
  const db = load()
  const u = (db.users||[]).find(x=>x.id === Number(userId))
  if(!u) return Promise.resolve({ resourcesViewed: 0, appointments: 0, recentViews: [], moodSummary: null, lastLogin: null })
  const resourcesViewed = (u.viewedResources||[]).length
  const appointments = (db.appointments||[]).filter(a => a.userId === u.id).length
  const recentViews = (u.viewedResources||[]).slice(-5).reverse().map(v=>{
    const res = (db.resources||[]).find(r=>r.id === v.id)
    return { id: v.id, title: res ? res.title : 'Resource', when: v.when }
  })
  const moodSummary = (u.moodHistory||[]).slice(-7)
  return Promise.resolve({ resourcesViewed, appointments, recentViews, moodSummary, lastLogin: u.lastLogin })
}

export function getCurrentUser(){
  const db = load()
  const uid = db.session && db.session.userId
  if(!uid){
    // if session cleared accidentally, check persistent key and restore session
    try{
      const pid = localStorage.getItem(PERSIST_KEY)
      if(pid){
        const pidNum = Number(pid)
        if(pidNum){ db.session.userId = pidNum; save(db); }
      }
    }catch(e){}
  }
  const finalUid = db.session && db.session.userId
  if(!finalUid) return Promise.resolve(null)
  const user = (db.users||[]).find(u=>u.id === uid) || null
  return Promise.resolve(user)
}

export function logout(){
  const db = load(); if(db.session) db.session.userId = null; save(db);
  try{ localStorage.removeItem(PERSIST_KEY) }catch(e){}
  return Promise.resolve()
}

// --- Admin helpers ---
export function getUsers(){
  const db = load()
  return Promise.resolve(db.users || [])
}

export function updateAppointmentStatus(id, status){
  const db = load()
  const a = (db.appointments||[]).find(x=>x.id === Number(id))
  if(!a) return Promise.reject(new Error('Not found'))
  a.status = status
  save(db)
  return Promise.resolve(a)
}

// --- Profile management ---
export function updateUser(id, patch){
  const db = load()
  const u = (db.users||[]).find(x=>x.id === Number(id))
  if(!u) return Promise.reject(new Error('User not found'))
  Object.assign(u, patch)
  save(db)
  // if updating current session user, reflect session
  if(db.session && db.session.userId === u.id){ db.session.userId = u.id; save(db) }
  return Promise.resolve(u)
}

