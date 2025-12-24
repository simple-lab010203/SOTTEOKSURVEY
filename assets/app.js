
let ALL = [];
let filtered = [];
let page = 1;
const pageSize = 20;

function escapeHtml(str){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function formatName(name){
  if(!name) return "소떡";
  // 기존 데이터에 '익명 123' 또는 '익명123' 형태가 들어있어 그 부분만 교체
  return name.replace(/^익명\s*/,'소떡 ').replace(/^익명/,'소떡');
}

function byQuery(items, q){
  if(!q) return items;
  const qq = q.trim().toLowerCase();
  return items.filter(it => it.text.toLowerCase().includes(qq));
}
function byCategory(items, cat){
  if(!cat || cat === "전체") return items;
  return items.filter(it => it.category === cat);
}
function apply(){
  const q = document.getElementById("q").value;
  const cat = document.getElementById("cat").value;
  filtered = byCategory(byQuery(ALL, q), cat);
  page = 1;
  render();
}
function render(){
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  page = Math.min(page, totalPages);

  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);

  document.getElementById("count").textContent = `표시: ${total.toLocaleString()}건 (총 ${ALL.length.toLocaleString()}건)`;
  document.getElementById("pageinfo").textContent = `${page} / ${totalPages}`;

  const grid = document.getElementById("grid");
  grid.innerHTML = slice.map(it => `
    <div class="card" id="c${it.id}">
      <div class="head">
        <div class="name">${escapeHtml(formatName(it.name))}</div>
        <div class="chip">${escapeHtml(it.category)}</div>
      </div>
      <div class="text">${escapeHtml(it.text)}</div>
      <div class="actions">
        <button class="smallbtn" data-copy="${escapeHtml(it.text)}">복사</button>
        <button class="smallbtn" data-link="${it.id}">링크</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const t = btn.getAttribute("data-copy");
      try{
        await navigator.clipboard.writeText(t);
        btn.textContent = "복사됨";
        setTimeout(()=>btn.textContent="복사", 900);
      }catch(e){
        alert("복사 권한이 필요합니다. 텍스트를 직접 선택해 복사해 주세요.");
      }
    });
  });

  grid.querySelectorAll("[data-link]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-link");
      const url = `${location.origin}${location.pathname}#c${id}`;
      try{
        await navigator.clipboard.writeText(url);
        btn.textContent = "링크복사됨";
        setTimeout(()=>btn.textContent="링크", 900);
      }catch(e){
        location.hash = `c${id}`;
      }
    });
  });

  document.getElementById("prev").disabled = page <= 1;
  document.getElementById("next").disabled = page >= totalPages;
}

async function init(){
  const res = await fetch("./comments.json");
  const json = await res.json();
  ALL = json.items;

  const set = new Set(["전체"]);
  ALL.forEach(it => set.add(it.category));
  const cats = Array.from(set);
  const sel = document.getElementById("cat");
  sel.innerHTML = cats.map(c => `<option>${escapeHtml(c)}</option>`).join("");

  filtered = ALL.slice();
  render();

  const hash = location.hash;
  if(hash && hash.startsWith("#c")){
    const id = parseInt(hash.replace("#c",""), 10);
    setTimeout(()=> {
      const el = document.getElementById(`c${id}`);
      if(el){
        el.style.borderColor = "rgba(51,198,182,.65)";
        el.style.boxShadow = "0 0 0 3px rgba(51,198,182,.14)";
        el.scrollIntoView({behavior:"smooth", block:"center"});
      }
    }, 400);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("q").addEventListener("input", () => apply());
  document.getElementById("cat").addEventListener("change", () => apply());
  document.getElementById("prev").addEventListener("click", () => { page--; render(); });
  document.getElementById("next").addEventListener("click", () => { page++; render(); });
  document.getElementById("top").addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
  init();
});
