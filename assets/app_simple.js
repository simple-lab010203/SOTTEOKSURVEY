// Minimal renderer (no search/filter/pagination)
(async function(){
  const listEl = document.getElementById('list');
  const countEl = document.getElementById('count');

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function toSotteok(name){
    // '익명 001' -> '소떡 001'
    return String(name ?? '').replace(/^익명\s*/,'소떡 ');
  }

  function card(item){
    const name = toSotteok(item.name);
    const cat = item.category ? String(item.category) : '';
    const text = item.text ? String(item.text) : '';

    const catPill = cat ? `<div class="pill">${esc(cat)}</div>` : '';
    return `
      <article class="card">
        <div class="cardTop">
          <div class="name">${esc(name)}</div>
          ${catPill}
        </div>
        <div class="text">${esc(text).replace(/\n/g,'<br>')}</div>
      </article>
    `;
  }

  try{
    const res = await fetch('comments.json', {cache: 'no-store'});
    if(!res.ok) throw new Error('comments.json not found');
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.items || []);
    const total = data.total ?? items.length;

    countEl.textContent = `총 ${total}건`;
    listEl.innerHTML = items.map(card).join('');
  } catch(e){
    console.error(e);
    countEl.textContent = '불러오기 실패';
    listEl.innerHTML = `<div class="card"><div class="text">comments.json을 불러오지 못했습니다. 파일이 레포 루트에 있는지 확인해줘.</div></div>`;
  }
})();