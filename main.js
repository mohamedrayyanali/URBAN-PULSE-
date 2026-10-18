/* UrbanPulse recovery simulator. Original js/main.js was absent from uploaded archive.
   This is an educational replacement, not the original physical model. */
const $ = id => document.getElementById(id);
const canvas=$('grid-canvas'),ctx=canvas.getContext('2d');
const N=8,S=70, types=['CONCRETE_SKYSCRAPER','ASPHALT_ROAD','UTILITY_HUB','TREE_CANOPY','POCKET_PARK','WATER_BODY'];
const icons={CONCRETE_SKYSCRAPER:'🏙️',ASPHALT_ROAD:'🛣️',UTILITY_HUB:'⚡',TREE_CANOPY:'🌳',POCKET_PARK:'🏞️',WATER_BODY:'💧'};
const effects={CONCRETE_SKYSCRAPER:5,ASPHALT_ROAD:7,UTILITY_HUB:6,TREE_CANOPY:-4,POCKET_PARK:-3,WATER_BODY:-5};
let grid=[],view='HYBRID',brush='TREE_CANOPY',selected=18,paused=false,speed=1,light=110,ambient=30,wind=2,elapsed=0,loss=0,history=[],connected=false,serialPort=null,reading=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const cell=i=>grid[i];
function initialize(){
 const scenario=$('scenario-select').value;
 grid=Array.from({length:64},(_,i)=>({type: (i%9===0?'TREE_CANOPY':i%7===0?'CONCRETE_SKYSCRAPER':i%5===0?'ASPHALT_ROAD':'ASPHALT_ROAD'),temp:ambient,failed:false}));
 [18,20,27,37,43,45].forEach(i=>grid[i].type='UTILITY_HUB');
 [6,14,34,54].forEach(i=>grid[i].type='TREE_CANOPY');
 if(scenario==='SUSTAINABLE_ECO_DISTRICT') grid.forEach((c,i)=>{if(i%3===0)c.type='TREE_CANOPY';});
 if(scenario==='METROPOLIS_HARBOR') [48,49,50,56,57,58].forEach(i=>grid[i].type='WATER_BODY');
 if(scenario==='DOMINO_CASCADE_CRITICAL') {ambient=38;$('ambient-slider').value=38;}
 else {ambient=30;$('ambient-slider').value=30;}
 loss=0;elapsed=0;history=[];selected=18;step();
}
function step(){
 const solar=(light/255)*7, next=grid.map((c,i)=>{
  const x=i%8,y=Math.floor(i/8),neighbors=[[x-1,y],[x+1,y],[x,y-1],[x,y+1]].filter(([a,b])=>a>=0&&a<8&&b>=0&&b<8).map(([a,b])=>grid[b*8+a].temp);
  const avg=neighbors.length?neighbors.reduce((a,b)=>a+b,0)/neighbors.length:ambient;
  const target=ambient+effects[c.type]+solar-wind*.35;
  return clamp(c.temp*.62+target*.28+avg*.10,10,85);
 });
 grid.forEach((c,i)=>{c.temp=next[i];c.failed=c.type==='UTILITY_HUB'&&c.temp>48.5;});
 const failed=grid.filter(c=>c.failed).length;if(failed)loss+=failed*125*speed;
 history.push(grid.reduce((s,c)=>s+c.temp,0)/64);if(history.length>60)history.shift();
 elapsed+=speed;render();
}
function paint(){
 ctx.clearRect(0,0,560,560);
 const max=Math.max(...grid.map(c=>c.temp));
 grid.forEach((c,i)=>{
  const x=(i%8)*S,y=Math.floor(i/8)*S;
  const t=clamp((c.temp-22)/43,0,1);
  let color=view==='LAND_COVER'?({CONCRETE_SKYSCRAPER:'#364152',ASPHALT_ROAD:'#263446',UTILITY_HUB:'#524020',TREE_CANOPY:'#175e47',POCKET_PARK:'#228358',WATER_BODY:'#125a87'}[c.type]):`hsl(${210-t*210}, ${55+t*30}%, ${19+t*22}%)`;
  if(view==='NETWORK')color='#111b2b';
  ctx.fillStyle=color;ctx.fillRect(x,y,S,S);ctx.strokeStyle='#29374a';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,S-2,S-2);
  ctx.font='9px monospace';ctx.fillStyle='#94a3b8';ctx.fillText(`${Math.floor(i/8)},${i%8}`,x+4,y+11);
  ctx.font='23px sans-serif';ctx.textAlign='center';ctx.fillText(icons[c.type],x+35,y+39);ctx.textAlign='start';
  if(c.type==='UTILITY_HUB'&&(view==='NETWORK'||view==='HYBRID')){ctx.strokeStyle=c.failed?'#ff3e53':'#38b2ac';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+35,y+36,26,0,Math.PI*2);ctx.stroke();}
  if(c.failed){ctx.fillStyle='#ff4a56';ctx.font='bold 12px sans-serif';ctx.fillText('✖',x+49,y+20);}
  if(i===selected){ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,S-4,S-4);}
 });
}
function render(){
 paint();const temps=grid.map(c=>c.temp),peak=Math.max(...temps),avg=temps.reduce((a,b)=>a+b,0)/64,failed=grid.filter(c=>c.failed).length;
 $('kpi-peak-temp').textContent=peak.toFixed(1)+'°C';$('kpi-avg-temp').textContent=avg.toFixed(1)+'°C';
 const resilience=clamp(100-failed*16-Math.max(0,avg-35)*1.5,0,100);
 $('kpi-resilience-val').textContent=resilience.toFixed(0)+'%';$('kpi-resilience-bar').style.width=resilience+'%';
 $('kpi-downtime-cost').textContent='$'+Math.round(loss).toLocaleString();$('kpi-burn-rate').textContent=`Active Loss: $${failed*125} / tick`;
 $('peak-temp-badge').textContent=peak>48?'CRITICAL':peak>40?'WARNING':'NOMINAL';
 const c=grid[selected];$('inspect-icon').textContent=icons[c.type];$('inspect-name').textContent=c.type.replaceAll('_',' ');
 $('inspect-coord').textContent=`(${Math.floor(selected/8)}, ${selected%8})`;
 $('inspect-temp').textContent=c.temp.toFixed(1)+'°C';$('inspect-heat-flux').textContent=(effects[c.type]+light/255*7).toFixed(1)+' W/m²';
 $('inspect-albedo').textContent=({TREE_CANOPY:'.25',ASPHALT_ROAD:'.05',WATER_BODY:'.10'}[c.type]||'.20');
 $('inspect-thermal-mass').textContent=({WATER_BODY:'240',CONCRETE_SKYSCRAPER:'85'}[c.type]||'55')+' kJ';
 $('inspect-cooling-offset').textContent=Math.min(0,effects[c.type]).toFixed(1)+'°C';
 $('inspect-desc').textContent=`Educational model: ${c.type.replaceAll('_',' ').toLowerCase()} changes local heating and cooling.`;
 $('inspect-utility-status').style.display=c.type==='UTILITY_HUB'?'block':'none';
 $('inspect-util-name').textContent='Utility Hub';$('inspect-util-badge').textContent=c.failed?'TRIPPED':'NOMINAL';
 $('inspect-util-load').textContent=c.failed?'0 MW':'120 MW';
 $('failure-log-list').innerHTML=failed?`<div class="log-item badge-critical"><strong>${failed} simulated utility failure(s)</strong><span>Modeled threshold: 48.5°C</span></div>`:'<div class="empty-log-state">✓ No failures detected in this simulated step.</div>';
 $('ambient-val-label').textContent=ambient.toFixed(1)+'°C';$('wind-speed-label').textContent=wind.toFixed(1)+' m/s';
 $('microbit-raw-light').textContent=String(Math.round(light));$('solar-val-label').textContent=Math.round(light)+' lux (simulated)';
 $('microbit-lux-val').textContent=Math.round(light/255*1100)+' W/m²';$('microbit-solar-shock-val').textContent='+'+(light/255*7).toFixed(2)+'°C';
 const leds=document.querySelectorAll('.microbit-led');leds.forEach((el,i)=>el.classList.toggle('on',i>=25-Math.round(light/255*25)));
 const spark=$('sparkline-canvas'),rect=spark.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
 if(rect.width>0){spark.width=Math.round(rect.width*dpr);spark.height=Math.round(rect.height*dpr);const sc=spark.getContext('2d');sc.scale(dpr,dpr);sc.clearRect(0,0,rect.width,rect.height);sc.strokeStyle='#38b2ac';sc.lineWidth=2;sc.beginPath();history.forEach((v,i)=>{const x=i/Math.max(1,history.length-1)*rect.width,y=rect.height-clamp((v-15)/55,0,1)*rect.height;i?sc.lineTo(x,y):sc.moveTo(x,y);});sc.stroke();}
}
function canvasIndex(e){const r=canvas.getBoundingClientRect();const x=clamp(Math.floor((e.clientX-r.left)*8/r.width),0,7),y=clamp(Math.floor((e.clientY-r.top)*8/r.height),0,7);return y*8+x;}
let dragging=false;
canvas.addEventListener('pointerdown',e=>{dragging=true;canvas.setPointerCapture(e.pointerId);const i=canvasIndex(e);selected=i;grid[i].type=brush;grid[i].failed=false;step();});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;const i=canvasIndex(e);selected=i;grid[i].type=brush;grid[i].failed=false;step();});
canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
document.querySelectorAll('.palette-btn').forEach(b=>b.addEventListener('click',()=>{brush=b.dataset.brush;document.querySelectorAll('.palette-btn').forEach(x=>x.classList.toggle('active',x===b));}));
document.querySelectorAll('.view-toggle-btn').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;document.querySelectorAll('.view-toggle-btn').forEach(x=>x.classList.toggle('active',x===b));render();}));
document.querySelectorAll('.speed-btn').forEach(b=>b.addEventListener('click',()=>{speed=num(b.dataset.speed)||1;document.querySelectorAll('.speed-btn').forEach(x=>x.classList.toggle('active',x===b));}));
$('btn-play-pause').addEventListener('click',()=>{paused=!paused;$('btn-play-pause').textContent=paused?'▶ Resume':'⏸ Pause';});
$('solar-slider').addEventListener('input',e=>{light=num(e.target.value);step();});
$('ambient-slider').addEventListener('input',e=>{ambient=num(e.target.value);step();});
$('wind-speed-slider').addEventListener('input',e=>{wind=num(e.target.value);step();});
$('wind-dir-select').addEventListener('change',step);
$('scenario-select').addEventListener('change',initialize);
$('btn-flashlight-burst').addEventListener('click',()=>{light=255;$('solar-slider').value=light;step();setTimeout(()=>{if(!connected){light=110;$('solar-slider').value=light;step();}},3000);});
$('btn-reset-grid').addEventListener('click',initialize);$('btn-reset-breakers').addEventListener('click',()=>{grid.forEach(c=>c.failed=false);render();});
$('btn-run-ai-optimizer').addEventListener('click',()=>{const picks=grid.map((c,i)=>({i,score:c.temp})).filter(({i})=>grid[i].type!=='UTILITY_HUB'&&grid[i].type!=='WATER_BODY').sort((a,b)=>b.score-a.score).slice(0,4);picks.forEach(({i})=>grid[i].type='TREE_CANOPY');$('ai-recommendations-list').innerHTML='<div class="ai-rec-card"><strong>4 high-heat cells planted with trees</strong><span>Heuristic placement based on simulated local temperature. Not an externally validated AI prediction.</span></div>';step();});
$('btn-export-report').addEventListener('click',()=>{const data={model:'UrbanPulse educational recovery simulation',scenario:$('scenario-select').value,grid,ambient,wind,light,estimatedLoss:loss};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='urbanpulse-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);});
[['btn-user-manual','modal-user-manual'],['btn-formulas-guide','modal-formulas-guide'],['btn-microbit-guide','modal-microbit-guide']].forEach(([btn,modal])=>$(btn)?.addEventListener('click',()=>$(modal)?.classList.add('open')));
[['btn-close-manual','modal-user-manual'],['btn-close-formulas','modal-formulas-guide'],['btn-close-guide','modal-microbit-guide']].forEach(([btn,modal])=>$(btn)?.addEventListener('click',()=>$(modal)?.classList.remove('open')));
document.querySelectorAll('.modal-overlay').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');}));
$('btn-copy-firmware')?.addEventListener('click',()=>navigator.clipboard?.writeText($('firmware-code-block').textContent));
let sound=true;$('btn-sound-toggle').addEventListener('click',()=>{sound=!sound;$('btn-sound-toggle').textContent=sound?'🔔 Audio On':'🔕 Audio Off';});
$('btn-connect-microbit').addEventListener('click',async()=>{
 if(!('serial' in navigator)){alert('Web Serial is not supported on this browser. Use Chrome or Edge on a compatible desktop computer, or continue in Virtual IoT mode.');return;}
 try{serialPort=await navigator.serial.requestPort();await serialPort.open({baudRate:115200});connected=true;$('hardware-status-badge').textContent='● micro:bit Connected';$('hardware-status-badge').className='status-pill connected';$('hardware-status-details').textContent='Live light sensor';
  const reader=serialPort.readable.getReader();reading=true;let buffer='';while(reading){const {value,done}=await reader.read();if(done)break;buffer+=new TextDecoder().decode(value);const lines=buffer.split('\n');buffer=lines.pop();for(const line of lines){try{const data=JSON.parse(line.trim());const v=Number(data.light);if(Number.isFinite(v)){light=clamp(v,0,255);$('solar-slider').value=light;step();}}catch{}}}reader.releaseLock();
 }catch(err){alert('micro:bit connection unavailable: '+err.message);}finally{connected=false;$('hardware-status-badge').textContent='○ Virtual IoT Sensor Mode';$('hardware-status-badge').className='status-pill virtual';}
});
initialize();setInterval(()=>{if(!paused)step();},1000);
