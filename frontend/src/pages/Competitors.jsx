import { useState } from 'react'

const sColors = {critical:'#FF4444',high:'#FF8C00',medium:'#2196F3',low:'#9C27B0',info:'#16a34a'}
const sBg = {critical:'#FFF5F5',high:'#FFF8F0',medium:'#F0F7FF',low:'#F8F0FF',info:'#F0FFF4'}

function GapCard({gap}) {
  const c = sColors[gap.severity]||'#FF8C00'
  const bg = sBg[gap.severity]||'#FFF8F0'
  return (
    <div style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:12,overflow:'hidden',marginBottom:10}}>
      <div style={{borderLeft:`4px solid ${c}`,padding:'18px 22px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <p style={{fontWeight:700,color:'#0a0a0a',fontSize:14}}>{gap.metric}</p>
          <span style={{background:bg,color:c,fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20}}>{gap.gap}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div style={{background:'#fafafa',borderRadius:8,padding:'10px 14px'}}>
            <p style={{fontSize:10,color:'#aaa',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.5px'}}>Yours</p>
            <p style={{fontSize:18,fontWeight:800,color:'#FF4444'}}>{gap.yours}</p>
          </div>
          <div style={{background:'#fafafa',borderRadius:8,padding:'10px 14px'}}>
            <p style={{fontSize:10,color:'#aaa',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.5px'}}>Theirs</p>
            <p style={{fontSize:18,fontWeight:800,color:'#16a34a'}}>{gap.theirs}</p>
          </div>
        </div>
        <div style={{background:'#F0FFF4',border:'1px solid #C6F6D5',borderRadius:8,padding:'10px 14px'}}>
          <p style={{fontSize:12,color:'#166534',lineHeight:1.6}}><span style={{fontWeight:700}}>How to close this gap: </span>{gap.recommendation}</p>
        </div>
      </div>
    </div>
  )
}

function ChannelCard({channel, onAnalyze, isAdded, loadingId}) {
  const loading = loadingId === channel.channel_id
  return (
    <div style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:12,padding:'16px 20px',display:'flex',alignItems:'center',gap:14,marginBottom:8}}>
      {channel.thumbnail
        ? <img src={channel.thumbnail} alt="" referrerPolicy="no-referrer" style={{width:44,height:44,borderRadius:10,objectFit:'cover',flexShrink:0}} />
        : <div style={{width:44,height:44,background:'#f0f0f0',borderRadius:10,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,color:'#aaa'}}>{channel.channel_name[0]}</div>
      }
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontWeight:700,fontSize:14,color:'#111',marginBottom:3}}>{channel.channel_name}</p>
        {channel.description && <p style={{fontSize:12,color:'#aaa',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{channel.description}</p>}
      </div>
      <button
        onClick={() => onAnalyze(channel.channel_id, channel.channel_name)}
        disabled={loading || isAdded}
        style={{background:isAdded?'#F0FFF4':loading?'#f5f5f5':'#111',color:isAdded?'#16a34a':loading?'#aaa':'#fff',border:isAdded?'1px solid #C6F6D5':'1px solid transparent',borderRadius:8,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:isAdded||loading?'default':'pointer',flexShrink:0,whiteSpace:'nowrap'}}
      >
        {isAdded ? 'Added' : loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </div>
  )
}

export default function Competitors() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingAnalyze, setLoadingAnalyze] = useState(null)
  const [activeTab, setActiveTab] = useState('search')
  const [searched, setSearched] = useState(false)

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setLoadingSearch(true)
    setSearched(true)
    fetch(`http://localhost:8000/competitors/search?q=${encodeURIComponent(searchQuery)}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.results) setSearchResults(d.results); setLoadingSearch(false) })
      .catch(() => setLoadingSearch(false))
  }

  const handleAnalyze = (channelId) => {
    if (analyses.find(a => a.competitor.channel_id === channelId)) return
    setLoadingAnalyze(channelId)
    fetch(`http://localhost:8000/competitors/analyze/${channelId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.competitor) {
          setAnalyses(prev => [...prev, d])
          setActiveTab('results')
        }
        setLoadingAnalyze(null)
      })
      .catch(() => setLoadingAnalyze(null))
  }

  const addedIds = analyses.map(a => a.competitor.channel_id)

  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:18,fontWeight:800,color:'#0a0a0a',marginBottom:4}}>Competitor analysis</h2>
        <p style={{fontSize:13,color:'#aaa'}}>Search for channels in your niche and get a full gap analysis showing exactly where you are behind and how to close it</p>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:24}}>
        {['search','results'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{padding:'8px 18px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',background:activeTab===tab?'#111':'#fff',color:activeTab===tab?'#fff':'#666',border:activeTab===tab?'1px solid #111':'1px solid #e0e0e0'}}>
            {tab === 'search' ? 'Search channels' : `Results (${analyses.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'search' && (
        <div>
          <div style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:12,padding:'20px 24px',marginBottom:20}}>
            <p style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:4}}>Find a competitor</p>
            <p style={{fontSize:12,color:'#aaa',marginBottom:16}}>Type the name of a YouTube channel in your niche — for example "Ali Abdaal" or "finance with Peter"</p>
            <div style={{display:'flex',gap:10}}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search YouTube channels..."
                style={{flex:1,padding:'10px 16px',borderRadius:8,border:'1px solid #e0e0e0',fontSize:13,outline:'none'}}
              />
              <button onClick={handleSearch} disabled={loadingSearch}
                style={{background:'#111',color:'#fff',padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',whiteSpace:'nowrap'}}>
                {loadingSearch ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {!searched && (
            <div style={{textAlign:'center',padding:'40px 0',color:'#aaa',fontSize:13}}>
              <p style={{fontSize:28,marginBottom:12}}>🔍</p>
              <p style={{fontWeight:600,color:'#888',marginBottom:6}}>Search for a channel to compare</p>
              <p>Type any YouTube channel name above to get started</p>
            </div>
          )}

          {searched && !loadingSearch && searchResults.length === 0 && (
            <div style={{textAlign:'center',padding:'40px 0',color:'#aaa',fontSize:13}}>No channels found. Try a different search term.</div>
          )}

          {searchResults.map(ch => (
            <ChannelCard key={ch.channel_id} channel={ch} onAnalyze={handleAnalyze} isAdded={addedIds.includes(ch.channel_id)} loadingId={loadingAnalyze} />
          ))}
        </div>
      )}

      {activeTab === 'results' && (
        <div>
          {analyses.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 0',color:'#aaa',fontSize:13}}>
              <p style={{fontSize:32,marginBottom:12}}>📊</p>
              <p style={{fontWeight:600,color:'#888',marginBottom:6}}>No competitors analyzed yet</p>
              <p>Go to Search to find and analyze a competitor channel</p>
            </div>
          ) : (
            analyses.map((analysis, i) => (
              <div key={i} style={{marginBottom:32}}>
                <div style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:12,padding:'20px 24px',marginBottom:16,display:'flex',alignItems:'center',gap:16}}>
                  {analysis.competitor.thumbnail && (
                    <img src={analysis.competitor.thumbnail} alt="" referrerPolicy="no-referrer" style={{width:52,height:52,borderRadius:10,objectFit:'cover'}} />
                  )}
                  <div style={{flex:1}}>
                    <p style={{fontWeight:800,fontSize:16,color:'#111',marginBottom:6}}>{analysis.competitor.channel_name}</p>
                    <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                      <span style={{fontSize:12,color:'#aaa'}}>{analysis.competitor.subscribers.toLocaleString()} subscribers</span>
                      <span style={{fontSize:12,color:'#aaa'}}>{analysis.competitor.avg_views_per_video.toLocaleString()} avg views/video</span>
                      <span style={{fontSize:12,color:'#aaa'}}>{analysis.competitor.upload_frequency}x uploads/week</span>
                      <span style={{fontSize:12,color:'#aaa'}}>{analysis.competitor.like_rate}% like rate</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <p style={{fontSize:10,color:'#aaa',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.5px'}}>Gaps found</p>
                    <p style={{fontSize:28,fontWeight:900,color:analysis.gaps.length>0?'#FF4444':'#16a34a'}}>{analysis.gaps.length}</p>
                  </div>
                </div>

                {analysis.gaps.length === 0 ? (
                  <div style={{background:'#F0FFF4',border:'1px solid #C6F6D5',borderRadius:12,padding:'20px 24px',textAlign:'center',marginBottom:16}}>
                    <p style={{color:'#166534',fontWeight:600,fontSize:14}}>You are performing on par with or better than this competitor on all measured metrics.</p>
                  </div>
                ) : (
                  <div style={{marginBottom:16}}>
                    <p style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:12}}>Where you are behind — and how to catch up</p>
                    {analysis.gaps.map((gap, j) => <GapCard key={j} gap={gap} />)}
                  </div>
                )}

                {analysis.competitor.recent_videos && analysis.competitor.recent_videos.length > 0 && (
                  <div style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:12,padding:'20px 24px'}}>
                    <p style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:12}}>Their recent videos — study what is working for them</p>
                    {analysis.competitor.recent_videos.map((v, k) => (
                      <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:k<analysis.competitor.recent_videos.length-1?'1px solid #f5f5f5':'none',gap:16}}>
                        <p style={{fontSize:12,color:'#333',flex:1,lineHeight:1.4}}>{v.title}</p>
                        <p style={{fontSize:12,fontWeight:700,color:'#111',flexShrink:0}}>{v.views.toLocaleString()} views</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
