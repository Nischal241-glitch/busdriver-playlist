const audio=document.getElementById("audio");
const songList=document.getElementById("songList"), playlist=document.getElementById("playlist");
const playlistBtn=document.getElementById("playlistBtn"), playBtn=document.getElementById("playBtn");
const prevBtn=document.getElementById("prevBtn"), nextBtn=document.getElementById("nextBtn");
const muteBtn=document.getElementById("muteBtn"), shuffleBtn=document.getElementById("shuffleBtn"), repeatBtn=document.getElementById("repeatBtn");
const progress=document.getElementById("progress"), title=document.getElementById("songTitle"), artist=document.getElementById("artist");
const currentTime=document.getElementById("currentTime"), duration=document.getElementById("duration"), tracksCount=document.getElementById("tracksCount");
let songs=[],current=-1,shuffle=false,repeat=false;
const fileInput=document.getElementById("fileInput");

const fmt=s=>!isFinite(s)?"0:00":`${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
const esc=v=>v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

async function loadPlaylist(){
  try{
    const r=await fetch("/api/songs");
    songs=await r.json();
    tracksCount.textContent=`${songs.length} TRACKS · NON-STOP`;
    render();
    if(songs.length) loadSong(0,false);
  }catch(e){
    songList.innerHTML='<div class="empty">Run START_SERVER.bat and open this page from the local server.</div>';
  }
}
function render(){
  if(!songs.length){songList.innerHTML='<div class="empty">Put MP3 files in the music folder or click ADD SONGS.</div>';return}
  songList.innerHTML=songs.map((s,i)=>`<div class="song ${i===current?"selected":""}" onclick="loadSong(${i},true)"><span class="song-num">${String(i+1).padStart(2,"0")}</span><span class="song-name">${esc(s.name)}</span><small>Bus Driver</small></div>`).join("");
}
function loadSong(i,auto=false){
  if(!songs.length)return;
  current=(i+songs.length)%songs.length;
  const s=songs[current];
  audio.src=s.url; title.textContent=s.name.replace(/\.[^/.]+$/,""); artist.textContent="Bus Driver Playlist";
  render(); if(auto)audio.play().catch(()=>{});
}
function next(){
  if(!songs.length)return;
  let i=current+1;
  if(shuffle&&songs.length>1)do{i=Math.floor(Math.random()*songs.length)}while(i===current);
  loadSong(i,true);
}
function prev(){if(audio.currentTime>5){audio.currentTime=0;return}loadSong(current-1,true)}
playBtn.onclick=()=>{if(current<0)return;if(audio.paused)audio.play();else audio.pause()};
prevBtn.onclick=prev;nextBtn.onclick=next;
playlistBtn.onclick=()=>playlist.classList.toggle("open");
muteBtn.onclick=()=>{audio.muted=!audio.muted;muteBtn.textContent=audio.muted?"🔇":"🔊"};
shuffleBtn.onclick=()=>{shuffle=!shuffle;shuffleBtn.classList.toggle("active",shuffle)};
repeatBtn.onclick=()=>{repeat=!repeat;repeatBtn.classList.toggle("active",repeat)};
audio.onplay=()=>playBtn.textContent="⏸";audio.onpause=()=>playBtn.textContent="▶";
audio.onloadedmetadata=()=>duration.textContent=fmt(audio.duration);
audio.ontimeupdate=()=>{currentTime.textContent=fmt(audio.currentTime);progress.value=audio.duration?audio.currentTime/audio.duration*100:0};
progress.oninput=()=>{if(audio.duration)audio.currentTime=progress.value/100*audio.duration};
audio.onended=()=>repeat?loadSong(current,true):next();
document.addEventListener("keydown",e=>{
 if(e.target.tagName==="INPUT")return;
 if(e.code==="Space"){e.preventDefault();playBtn.click()}
 if(e.key==="ArrowRight")audio.currentTime=Math.min(audio.duration||0,audio.currentTime+10);
 if(e.key==="ArrowLeft")audio.currentTime=Math.max(0,audio.currentTime-10);
 if(e.key.toLowerCase()==="n")next();if(e.key.toLowerCase()==="p")prev();
 if(e.key.toLowerCase()==="q")playlist.classList.toggle("open");
});

fileInput?.addEventListener("change",e=>{
  [...e.target.files].forEach(file=>songs.push({name:file.name,url:URL.createObjectURL(file)}));
  if(current<0 && songs.length) loadSong(0,false);
  else render();
  fileInput.value="";
});

function clock(){document.getElementById("clock").textContent=new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
setInterval(clock,1000);clock();loadPlaylist();
