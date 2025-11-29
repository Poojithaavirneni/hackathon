import React, { useEffect, useState } from 'react'
import { getResources, incrementView } from '../data/db'

function toEmbedUrl(url){
  if(!url) return null
  try{
    const u = new URL(url)
    if(u.hostname.includes('youtube.com')){
      const v = u.searchParams.get('v')
      if(v) return `https://www.youtube.com/embed/${v}`
    }
    if(u.hostname === 'youtu.be'){
      const id = u.pathname.replace('/','')
      if(id) return `https://www.youtube.com/embed/${id}`
    }
  }catch(e){
    if(url.includes('youtube.com/watch?v=')) return url.replace('watch?v=','embed/')
    if(url.includes('youtu.be/')) return url.replace('youtu.be/','youtube.com/embed/')
  }
  return null
}

export default function Resources({ initialFilter = '' }) {
  const [res, setRes] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState(initialFilter || '')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('popular')

  useEffect(() => { load() }, [])

  function load(){ getResources().then(setRes).catch(() => setRes([])) }

  // open a resource in the modal detail and record view
  const open = async (r)=>{
    try{
      await incrementView(r.id)
      // refresh list counts
      const fresh = await getResources()
      setRes(fresh)
      const updated = fresh.find(x => x.id === r.id) || r
      setSelected(updated)
    }catch(e){ setSelected(r) }
  }

  const close = ()=> setSelected(null)

  useEffect(()=>{
    // if parent passed a filter, apply it
    if(initialFilter){ setFilter(initialFilter) }
  },[initialFilter])

  // derived categories
  const categories = Array.from(new Set(res.map(r=>r.category).filter(Boolean)))

  // filter/search/sort
  let visible = res.slice()
  if(filter) visible = visible.filter(r=>r.category === filter)
  if(search) visible = visible.filter(r=> (r.title||'').toLowerCase().includes(search.toLowerCase()) || (r.content||'').toLowerCase().includes(search.toLowerCase()))
  if(sortKey === 'popular') visible.sort((a,b)=>(b.views||0)-(a.views||0))
  else if(sortKey === 'title') visible.sort((a,b)=>(a.title||'').localeCompare(b.title||''))
  else if(sortKey === 'newest') visible.sort((a,b)=> (b.id||0)-(a.id||0))

  return (
    <div>
      <h2>Health Resources Hub</h2>
      <p>Articles, videos and guides categorized by topic.</p>

      <div className="controls">
        <div className="filter-controls">
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sortKey} onChange={e=>setSortKey(e.target.value)}>
            <option value="popular">Sort: Most viewed</option>
            <option value="newest">Sort: Newest</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
        <div>
          <input className="search-input" placeholder="Search resources..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div className="resource-list">
        {visible.map(r => (
          <article key={r.id} className="resource card">
            <h4 className="resource-title" onClick={()=>open(r)}>{r.title}</h4>
            <small className="resource-meta">Category: {r.category}</small>
            <p className="resource-excerpt">{r.content ? (r.content.length > 140 ? r.content.slice(0,140) + '…' : r.content) : r.url}</p>
            <div className="resource-actions">
              <button className="secondary" onClick={()=>open(r)}>Open</button>
              <div className="resource-views">Views: {r.views||0}</div>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="modal-close secondary" onClick={close}>Close</button>
            <h2 className="resource-title">{selected.title}</h2>
            <div className="resource-meta">Category: <strong>{selected.category}</strong> • Type: <em>{selected.type}</em></div>
            <div className="resource-content">
              {selected.type === 'video' || toEmbedUrl(selected.url) ? (
                (()=>{
                  const embed = selected.type === 'video' ? toEmbedUrl(selected.url) || selected.url : toEmbedUrl(selected.url)
                  if(embed) return <div className="video-wrap"><iframe title={selected.title} src={embed} frameBorder="0" allowFullScreen width="100%" height="360"></iframe></div>
                  return selected.content ? <p>{selected.content}</p> : <a href={selected.url} target="_blank" rel="noreferrer">Open resource</a>
                })()
              ) : (
                selected.content ? <p>{selected.content}</p> : <a href={selected.url} target="_blank" rel="noreferrer">Open resource</a>
              )}
            </div>
            <div className="resource-footer">
              <div>Views: <strong>{selected.views||0}</strong></div>
              <div style={{marginLeft:'auto'}}>ID: {selected.id}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
