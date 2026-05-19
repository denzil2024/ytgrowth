/*
 * My Videos preview. Mounts the real Dashboard (My Videos is inline)
 * deep-linked to nav=Videos, with mocked videos + optimizations.
 *   ?state=all (default) — video cards grid
 *   ?state=tracked       — tracked optimisations list (DeltaCell rows)
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import Dashboard from './src/pages/Dashboard.jsx'

const state = new URLSearchParams(window.location.search).get('state') || 'all'
const u = new URL(window.location.href)
if (!u.searchParams.get('nav')) { u.searchParams.set('nav', 'Videos'); window.history.replaceState({}, '', u) }

const VIDS = ['dQw4w9WgXcQ','9bZkp7q19f0','kJQP7kiw5Fk','JGwWNGJdvx8','OPf0YbXqDm0','3JZ_D3ELwOQ','L_jWHffIx5E','fJ9rUzIMcZQ'].map((id,i)=>({
  video_id:id,
  title:['I spent 24 hours testing budget meals','Why every creator is switching in 2026','My honest review of working from home','Living on a 5K budget — the real cost','A week of cheap dinners that slap','The cafe wifi speed test nobody asked for','30 days, one kitchen, zero takeout','How I doubled retention in a month'][i],
  thumbnail:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  views:[412000,287000,198400,156800,124700,98200,71200,52300][i],
  likes:[17700,12100,8200,6400,5100,3900,2800,2100][i],
  comments:[820,540,410,300,260,180,140,90][i],
  duration:i%3===0?'PT0M48S':'PT11M30S',
  published_at:new Date(Date.now()-86400_000*(4+i*6)).toISOString(),
}))
const OPTS = [
  { video_id:'dQw4w9WgXcQ', thumbnail_url:'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', before_title:'house tour', after_title:'I spent 24 hours in my tiny Nairobi apartment', optimized_at:new Date(Date.now()-86400_000*8).toISOString(), before_views:9200, current_views:41200, before_likes:300, current_likes:1780, before_comments:40, current_comments:318 },
  { video_id:'9bZkp7q19f0', thumbnail_url:'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg', before_title:'tiktok video', after_title:'Why every Kenyan creator is moving to TikTok in 2026', optimized_at:new Date(Date.now()-86400_000*15).toISOString(), before_views:21000, current_views:71300, before_likes:540, current_likes:2980, before_comments:60, current_comments:210 },
]

const J=(o)=>new Response(JSON.stringify(o),{headers:{'Content-Type':'application/json'}})
const of_=window.fetch
window.fetch=async(url,opts)=>{
  const s=String(url)
  if(s.includes('/auth/data')) return J({ channel:{channel_id:'UCdemo',channel_name:'Life with Nthenya',email:'d@y.app',thumbnail:'https://yt3.googleusercontent.com/ytc/AIdro_kMR-4cElBYJtJZW6jJ2v9G2YBOe2qj1y3WUJZxR4ldNw=s176-c-k-c0x00ffffff-no-rj',subscribers:41200,total_views:3180000,video_count:96}, videos:VIDS, insights:{channelScore:78,priorityActions:[]} })
  if(s.includes('/channels/list')) return J({channels:[],channels_allowed:1,can_add_more:false})
  if(s.includes('/auth/me')) return J({plan:'growth',free_tier_features:{}})
  if(s.includes('/seo/optimizations')) return J({optimizations:OPTS})
  if(s.includes('/auth/milestones')) return J({milestones:[]})
  if(s.includes('/chat/state')) return J({conversations:[],conversation_id:null})
  if(s.includes('/dashboard/')||s.includes('/video-ideas')) return J({})
  if(s.startsWith('http')) return of_(url,opts)
  return J({})
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Dashboard))

if (state === 'tracked') {
  setTimeout(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const t = btns.find(b => /tracked optimisation/i.test(b.textContent || ''))
    if (t) t.click()
  }, 700)
}
