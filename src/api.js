// Frontend API shim
// Tries to call a real backend under /api/* using fetch. If that fails (no backend),
// falls back to local data layer functions in ./data/db.js.

import * as db from './data/db'

const API_PREFIX = '/api'

async function tryFetch(path, opts){
  try{
    const res = await fetch(API_PREFIX + path, opts)
    if(!res.ok) throw new Error('Network response not ok')
    return res.json()
  }catch(e){
    // rethrow to allow callers to detect and fallback
    throw e
  }
}

export async function getResources(){
  try{ return await tryFetch('/resources') }catch(e){ return db.getResources() }
}

export async function incrementView(id){
  try{ await tryFetch(`/resources/${id}/view`, { method: 'POST' }); return getResources() }catch(e){ return db.incrementView(id) }
}

export async function getAnalytics(){
  try{ return await tryFetch('/analytics') }catch(e){ return db.getAnalytics() }
}

export async function addFeedback(payload){
  try{ return await tryFetch('/feedback',{ method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) }) }catch(e){ return db.addFeedback(payload) }
}

export async function getFeedbacks(){
  try{ return await tryFetch('/feedback') }catch(e){ return db.getFeedbacks() }
}

export async function deleteFeedback(id){
  try{ return await tryFetch(`/feedback/${id}`, { method: 'DELETE' }) }catch(e){ return db.deleteFeedback(id) }
}

export async function addAppointment(payload){
  try{ return await tryFetch('/appointments',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) }) }catch(e){ return db.addAppointment(payload) }
}

export async function getAppointments(){
  try{ return await tryFetch('/appointments') }catch(e){ return db.getAppointments() }
}

export async function deleteAppointment(id){
  try{ return await tryFetch(`/appointments/${id}`, { method: 'DELETE' }) }catch(e){ return db.deleteAppointment(id) }
}

export async function getUsers(){
  try{ return await tryFetch('/users') }catch(e){ return db.getUsers() }
}

export async function addResource(payload){
  try{ return await tryFetch('/resources',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) }) }catch(e){ return db.addResource(payload) }
}

export async function updateResource(id, patch){
  try{ return await tryFetch(`/resources/${id}`, { method:'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify(patch) }) }catch(e){ return db.updateResource(id, patch) }
}

export async function deleteResource(id){
  try{ return await tryFetch(`/resources/${id}`, { method:'DELETE' }) }catch(e){ return db.deleteResource(id) }
}

export async function updateAppointmentStatus(id, status){
  try{ return await tryFetch(`/appointments/${id}/status`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ status }) }) }catch(e){ return db.updateAppointmentStatus(id, status) }
}

export default {
  getResources,
  incrementView,
  getAnalytics,
  addFeedback,
  getFeedbacks,
  deleteFeedback,
  addAppointment,
  getAppointments,
  deleteAppointment,
  getUsers,
  addResource,
  updateResource,
  deleteResource,
  updateAppointmentStatus
}
