/* Silky Beauty Enterprise — browser-only prototype.
   No external APIs, cloud uploads, payments, or real authentication are configured. */
(() => {
  'use strict';
  const STORAGE_KEY = 'silkyBeautyEnterpriseGitHubDemoV1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const today = () => new Date().toISOString().slice(0, 10);
  const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const seedProducts = [
    {id:1,brand:'Minimalist',name:'Oat Extract Gentle Cleanser',category:'Cleanser',types:['Dry','Sensitive','Normal'],ingredients:'Oat extract, gentle surfactants',price:299,description:'A gentle cleanse-focused sample listing for a simple daily routine.',style:'cleanser'},
    {id:2,brand:'Cetaphil',name:'Moisturising Cream',category:'Moisturizer',types:['Dry','Sensitive','Normal'],ingredients:'Humectants and emollients',price:499,description:'A rich moisturiser-style sample for skin that feels dry or tight.',style:'jar'},
    {id:3,brand:'Simple',name:'Refreshing Facial Wash',category:'Cleanser',types:['Oily','Combination','Normal'],ingredients:'Mild cleansing agents',price:385,description:'A straightforward cleanser option for everyday use.',style:'cleanser'},
    {id:4,brand:'Neutrogena',name:'Ultra Sheer Sunscreen SPF 50+',category:'Sunscreen',types:['Oily','Combination','Normal'],ingredients:'Broad-spectrum UV filters',price:599,description:'Sample sun-care listing. Check current formulation and label before purchase.',style:'sun'},
    {id:5,brand:'Dot & Key',name:'Hydrating Water Cream',category:'Moisturizer',types:['Oily','Combination'],ingredients:'Hydrating humectants',price:449,description:'Lightweight moisturiser-style sample listing.',style:'jar'},
    {id:6,brand:'The Derma Co',name:'Hyaluronic Hydrating Serum',category:'Serum',types:['Dry','Oily','Combination','Normal'],ingredients:'Hyaluronic acid',price:499,description:'A hydrating serum-style sample; introduce one new product at a time.',style:'serum'},
    {id:7,brand:'Re’equil',name:'Daily Protection Sunscreen',category:'Sunscreen',types:['Dry','Sensitive','Normal'],ingredients:'UV filters, emollients',price:695,description:'Sample sunscreen listing. Verify SPF, UVA rating and product details.',style:'sun'},
    {id:8,brand:'Plum',name:'Nourishing Lip Care',category:'Lip care',types:['Dry','Sensitive','Normal','Oily','Combination'],ingredients:'Emollients',price:225,description:'Simple lip-care sample listing to complement your routine.',style:'jar'}
  ];
  const emptyState = () => ({user:null,products:seedProducts,assessment:null,history:[],favorites:[],notes:[],tasks:[],enquiries:[],settings:{hero:'Your Skin. Your Routine. Your Glow.',subtitle:"Discover personalised skincare routines and beauty recommendations designed around your skin's unique needs."}});
  let db;
  try { db = {...emptyState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')}; }
  catch { db = emptyState(); }
  if (!Array.isArray(db.products) || !db.products.length) db.products = seedProducts;
  ['history','favorites','notes','tasks','enquiries'].forEach(key => { if (!Array.isArray(db[key])) db[key] = []; });
  if (!db.settings) db.settings = emptyState().settings;
  let assessmentStep = 0, answers = {}, photoPreview = '', taskFilter = 'All', toastTimer;
  const app = $('#app'), modalRoot = $('#modal-root'), toastEl = $('#toast');

  function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch { notify('Browser storage is full. Remove a large image preview or export and clear demo data.'); } }
  function notify(message) { toastEl.textContent = message; toastEl.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2700); }
  function scrollTop() { window.scrollTo({top:0,behavior:'smooth'}); }
  function setView(view) {
    $('#main-nav').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded','false');
    if (view === 'home') { location.hash = 'home'; scrollTop(); return; }
    if (view === 'assessment') renderAssessment();
    else if (view === 'results') renderResults();
    else if (view === 'products') renderProducts();
    else if (view === 'dashboard') renderDashboard();
    else if (view === 'admin') renderAdmin();
    else if (view === 'contact') renderContact();
    scrollTop();
  }
  function bindGlobal() {
    document.addEventListener('click', event => {
      const viewButton = event.target.closest('[data-view]');
      if (viewButton) { event.preventDefault(); setView(viewButton.dataset.view); }
      const action = event.target.closest('[data-action]');
      if (action) runAction(action.dataset.action, action.dataset);
      if (event.target.classList.contains('modal-back')) closeModal();
    });
    $('#menu-toggle').addEventListener('click', () => {
      const nav = $('#main-nav'); nav.classList.toggle('open');
      $('#menu-toggle').setAttribute('aria-expanded', String(nav.classList.contains('open')));
    });
    $('#year').textContent = new Date().getFullYear();
    window.addEventListener('hashchange', () => { if (location.hash === '#home' || location.hash === '') { /* native anchor scrolling */ } });
  }
  function productCard(product) {
    const isFav = db.favorites.includes(product.id);
    return `<article class="product-card"><div class="product-art ${escapeHTML(product.style || '')}"><span class="art-flower">✿</span></div><div class="product-meta">${escapeHTML(product.brand)} · ${escapeHTML(product.category)}</div><h3>${escapeHTML(product.name)}</h3><div class="small-note">${escapeHTML(product.types.join(' · '))}</div><p class="product-price">${money(product.price)} <span class="demo-price">· demo price</span></p><div class="product-actions"><button class="button button-dark" data-action="product-detail" data-id="${product.id}">Details</button><button class="button button-ghost" data-action="toggle-favorite" data-id="${product.id}">${isFav?'♥ Saved':'♡ Save'}</button></div></article>`;
  }
  function renderFeatured() { $('#featured-products').innerHTML = db.products.slice(0,4).map(productCard).join(''); }
  function renderProducts() {
    app.innerHTML = `<section class="app-page"><div class="app-container"><div class="page-head"><div><p class="eyebrow">THE BEAUTY EDIT · DEMO CATALOGUE</p><h1>Products to explore</h1><p class="muted">Sample listings only; no official brand partnerships are implied.</p></div><button class="button button-ghost" data-view="dashboard">My favourites ♡</button></div><div class="form-grid"><div class="field"><label for="product-search">Search products</label><input id="product-search" placeholder="Search name, brand or ingredient"></div><div class="field"><label for="product-category">Category</label><select id="product-category"><option>All categories</option>${[...new Set(db.products.map(p=>p.category))].map(c=>`<option>${escapeHTML(c)}</option>`).join('')}</select></div></div><div class="product-grid" id="all-products">${db.products.map(productCard).join('')}</div></div></section>`;
    $('#product-search').addEventListener('input', filterProducts); $('#product-category').addEventListener('change', filterProducts);
  }
  function filterProducts() {
    const query = $('#product-search').value.toLowerCase(), category = $('#product-category').value;
    const found = db.products.filter(p => (category === 'All categories' || p.category === category) && [p.name,p.brand,p.ingredients].join(' ').toLowerCase().includes(query));
    $('#all-products').innerHTML = found.map(productCard).join('') || '<div class="empty">No products match your search.</div>';
  }
  function showProduct(id) {
    const p = db.products.find(item => item.id === Number(id)); if (!p) return;
    modalRoot.innerHTML = `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><div class="modal-head"><span class="eyebrow">PRODUCT DETAILS · DEMO LISTING</span><button class="close-button" data-action="close-modal" aria-label="Close">×</button></div><div class="product-art ${escapeHTML(p.style)}" style="margin:16px 0"><span class="art-flower">✿</span></div><h2 id="product-modal-title">${escapeHTML(p.name)}</h2><p>${escapeHTML(p.brand)} · ${escapeHTML(p.category)} · <strong>${money(p.price)}</strong> (sample price)</p><p>${escapeHTML(p.description)}</p><p><strong>Ingredients / features:</strong> ${escapeHTML(p.ingredients)}</p><p><strong>May suit:</strong> ${escapeHTML(p.types.join(', '))}</p><div class="notice warn">Check the full ingredient list, current price and seller details before buying. Patch-test new products.</div><div class="button-row"><button class="button button-primary" data-action="add-routine" data-id="${p.id}">Add to my routine</button><button class="button button-ghost" data-action="toggle-favorite" data-id="${p.id}">♡ Save favourite</button></div></div></div>`;
  }
  function closeModal() { modalRoot.innerHTML = ''; }
  function toggleFavorite(id) {
    id = Number(id); db.favorites = db.favorites.includes(id) ? db.favorites.filter(x=>x!==id) : [...db.favorites,id]; persist(); notify(db.favorites.includes(id) ? 'Added to favourites' : 'Removed from favourites');
    if ($('#all-products')) filterProducts(); else if (app.dataset.view === 'dashboard') renderDashboard('Favourites'); renderFeatured();
  }
  function addRoutine(id) {
    const p = db.products.find(item => item.id === Number(id)); if (!p) return;
    if (!db.tasks.some(t=>t.title === `Review product: ${p.name}`)) db.tasks.push({id:Date.now(),title:`Review product: ${p.name}`,due:today(),time:'PM',done:false});
    persist(); closeModal(); notify('Added to your task list');
  }

  const steps = [
    {title:'A little about you',sub:'Optional details help tailor the suggestions.',fields:[['name','Display name','text','e.g. Chandana'],['age','Age range','select',['Prefer not to say','Under 18','18–24','25–34','35–44','45+']],['city','City in India','text','e.g. Hyderabad'],['budget','Preferred product budget','select',['No preference','Under ₹500','₹500–₹1,000','₹1,000–₹2,000','₹2,000+']]]},
    {title:'Your skin type',sub:'Choose what feels closest to your usual skin.',fields:[['skin','Skin type','choices',['Dry','Oily','Combination','Normal','Sensitive','Not sure']],['tone','Skin tone (optional)','choices',['Fair','Light','Medium','Tan','Deep','Prefer not to say']],['undertone','Undertone (optional)','choices',['Warm','Cool','Neutral','Not sure']]]},
    {title:'Hydration & concerns',sub:'Select any concerns you notice. These are not diagnoses.',fields:[['concerns','Skin concerns','checks',['Tightness after washing','Dry or flaky patches','Excess oil or shine','Dull appearance','Occasional redness or irritation','Feeling dehydrated','Uneven-looking skin tone','Other concern']],['other','Other concern (optional)','text','Describe briefly'],['tight','Tightness after face washing?','select',['Not sure','Never','Sometimes','Often']]]},
    {title:'Your current routine',sub:'Tell us what you use today, if anything.',fields:[['cleanser','Current cleanser','text','Product name (optional)'],['moisturizer','Current moisturiser','text','Product name (optional)'],['sunscreen','Current sunscreen','text','Product name (optional)'],['serum','Serum or treatment','text','Product name (optional)'],['irritation','Products that cause irritation','text','Optional'],['time','Time spent on skincare','select',['Under 5 minutes','5–10 minutes','10–15 minutes','15+ minutes']],['pref','Routine preference','select',['AM and PM','Morning only','Evening only','Keep it minimal']]]},
    {title:'Optional photo & consent',sub:'A photo is not required and will not be analysed for medical conditions.',fields:[['photo','Optional face image','file',[]],['consent','I understand this prototype keeps the image preview in this browser and does not upload it to a server.','check',[]]]}
  ];
  function renderAssessment() {
    assessmentStep = 0; photoPreview = '';
    answers = {name:'',age:'Prefer not to say',city:'',budget:'No preference',skin:'Not sure',tone:'Prefer not to say',undertone:'Not sure',concerns:[],other:'',tight:'Not sure',cleanser:'',moisturizer:'',sunscreen:'',serum:'',irritation:'',time:'5–10 minutes',pref:'AM and PM',consent:false};
    if (db.draft) answers = {...answers,...db.draft,photoData:undefined};
    renderAssessmentStep();
  }
  function renderAssessmentStep() {
    const step = steps[assessmentStep];
    const fieldHTML = step.fields.map(([key,label,type,options]) => {
      if (type === 'choices') return `<div class="field"><label>${label}</label><div class="choice-grid">${options.map(option=>`<button type="button" class="choice ${answers[key]===option?'selected':''}" data-action="pick-answer" data-key="${key}" data-value="${escapeHTML(option)}">${escapeHTML(option)}</button>`).join('')}</div></div>`;
      if (type === 'checks') return `<div class="field"><label>${label}</label><div class="choice-grid">${options.map(option=>`<button type="button" class="choice ${(answers[key]||[]).includes(option)?'selected':''}" data-action="toggle-concern" data-value="${escapeHTML(option)}">${(answers[key]||[]).includes(option)?'✓ ':''}${escapeHTML(option)}</button>`).join('')}</div></div>`;
      if (type === 'select') return `<div class="field"><label>${label}</label><select data-answer="${key}">${options.map(option=>`<option ${answers[key]===option?'selected':''}>${escapeHTML(option)}</option>`).join('')}</select></div>`;
      if (type === 'file') return `<div class="field"><label>${label}</label><input id="face-photo" type="file" accept="image/png,image/jpeg,image/webp"><p class="small-note">JPG, PNG or WEBP · maximum 5 MB. Local preview only; no cloud upload.</p><div>${photoPreview?`<img src="${photoPreview}" alt="Local image preview" style="max-width:160px;border-radius:12px;display:block;margin:10px 0"><button class="button button-ghost" data-action="remove-photo">Remove image</button>`:''}</div></div>`;
      if (type === 'check') return `<div class="field"><label><input type="checkbox" data-answer="${key}" ${answers[key]?'checked':''} style="width:auto;margin-right:8px">${label}</label></div>`;
      return `<div class="field"><label>${label}</label><input data-answer="${key}" value="${escapeHTML(answers[key]||'')}" placeholder="${escapeHTML(options)}"></div>`;
    }).join('');
    app.dataset.view = 'assessment';
    app.innerHTML = `<section class="app-page"><div class="app-container" style="max-width:850px"><div class="page-head"><div><p class="eyebrow">PERSONAL SKINCARE DISCOVERY · DEMO</p><h1>Let's get to know your skin.</h1><p class="muted">Step ${assessmentStep+1} of ${steps.length} · Answers stay in this browser demo.</p></div><button class="button button-ghost" data-action="save-draft">Save draft</button></div><div class="progress"><span style="width:${(assessmentStep+1)/steps.length*100}%"></span></div><div class="card"><p class="eyebrow">STEP ${assessmentStep+1}</p><h2>${step.title}</h2><p class="muted">${step.sub}</p>${fieldHTML}<div class="form-nav">${assessmentStep?'<button class="button button-ghost" data-action="assessment-back">← Back</button>':'<button class="button button-ghost" data-view="home">Cancel</button>'}${assessmentStep<steps.length-1?'<button class="button button-primary" data-action="assessment-next">Continue →</button>':'<button class="button button-primary" data-action="submit-assessment">Create my routine ✧</button>'}</div></div><p class="small-note center">Skin tone is a self-selected preference only. It is never used to diagnose conditions or infer personal characteristics.</p></div></section>`;
    $$('[data-answer]',app).forEach(input=>input.addEventListener(input.type==='checkbox'?'change':'input',()=>{answers[input.dataset.answer]=input.type==='checkbox'?input.checked:input.value;}));
    const photoInput = $('#face-photo'); if (photoInput) photoInput.addEventListener('change', processPhoto);
  }
  function processPhoto(event) {
    const file = event.target.files[0]; if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { notify('Choose a JPG, PNG or WEBP image.'); return; }
    if (file.size > 5*1024*1024) { notify('Image must be 5 MB or smaller.'); return; }
    if (!answers.consent) { notify('Please provide consent before previewing a photo.'); event.target.value=''; return; }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => { const canvas=document.createElement('canvas'), scale=Math.min(1,900/image.width,900/image.height); canvas.width=Math.round(image.width*scale); canvas.height=Math.round(image.height*scale); canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height); photoPreview=canvas.toDataURL('image/jpeg',.78); renderAssessmentStep(); };
      image.src=reader.result;
    };
    reader.readAsDataURL(file);
  }
  function submitAssessment() {
    const record = {...answers,photoPreview:'',created:new Date().toISOString(),id:Date.now()};
    db.assessment=record; db.history.unshift(record); delete db.draft;
    if (!db.user) db.user={name:answers.name||'Demo Customer',email:'',mode:'demo'};
    persist(); renderResults();
  }
  function getRecommendations(a=db.assessment) {
    if (!a) return null;
    const skin=a.skin||'Not sure', concerns=a.concerns||[];
    const sensitive=skin==='Sensitive'||concerns.includes('Occasional redness or irritation');
    const hydration=concerns.some(x=>['Tightness after washing','Dry or flaky patches','Feeling dehydrated'].includes(x))||skin==='Dry';
    const cleanser=(skin==='Dry'||sensitive)?'Use a gentle, non-stripping cleanser.':'Use a gentle cleanser; avoid scrubbing or washing excessively.';
    const moisturiser=hydration?'Choose a moisturiser with humectants such as glycerin and barrier-supporting emollients; ceramides may be useful.':skin==='Oily'?'Try a lightweight moisturiser; oily skin can still need hydration.':'Choose a comfortable moisturiser and adjust texture to how your skin feels.';
    return {skin,hydration,am:[cleanser,moisturiser,'Use broad-spectrum SPF 30+ sunscreen during the day; reapply according to the label and sun exposure.'],pm:[cleanser,'Apply a suitable moisturiser after cleansing.','If adding a treatment, choose one for a specific cosmetic goal and introduce it gradually.'],caution:sensitive?'Prioritise fragrance-free options, patch-test, and introduce only one new product at a time.':'Introduce one new product at a time and patch-test before regular use.',ingredients:hydration?'Glycerin, hyaluronic acid, ceramides and suitable emollients':'Glycerin, suitable moisturisers and broad-spectrum sunscreen'};
  }
  function renderResults() {
    if (!db.assessment) { renderAssessment(); return; }
    const a=db.assessment,r=getRecommendations(),matches=db.products.filter(p=>p.types.includes(a.skin)||a.skin==='Not sure').slice(0,3);
    app.dataset.view='results';
    app.innerHTML=`<section class="app-page"><div class="app-container"><div class="page-head"><div><p class="eyebrow">YOUR SKIN SNAPSHOT · ${new Date(a.created).toLocaleDateString('en-IN')}</p><h1>Your routine, thoughtfully considered.</h1><p class="muted">Based on self-reported answers. General cosmetic guidance, not a diagnosis.</p></div><div class="button-row"><button class="button button-ghost" data-action="download-report">↓ Download report</button><button class="button button-primary" data-action="share-summary">Share / copy summary</button></div></div><div class="result-hero"><p class="eyebrow">YOUR SELECTED SKIN PROFILE</p><h2>${escapeHTML(a.skin)} skin${a.tone&&a.tone!=='Prefer not to say'?' · '+escapeHTML(a.tone)+' tone':''}</h2><p>${a.concerns?.length?`Reported concerns: ${escapeHTML(a.concerns.join(', '))}`:'You did not select any specific concerns.'}</p><span class="pill">Hydration focus: ${r.hydration?'Prioritise hydration':'Keep hydration balanced'}</span><span class="pill">Undertone: ${escapeHTML(a.undertone||'Not sure')}</span></div><div class="result-grid"><div class="card"><span class="pill">AM · MORNING</span><h3>Start fresh</h3><ul class="clean-list">${r.am.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><button class="button button-ghost" data-action="make-tasks" data-time="AM">Add AM steps to tasks</button></div><div class="card"><span class="pill">PM · EVENING</span><h3>Unwind gently</h3><ul class="clean-list">${r.pm.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><button class="button button-ghost" data-action="make-tasks" data-time="PM">Add PM steps to tasks</button></div><div class="card"><h3>Ingredients to consider</h3><p>${escapeHTML(r.ingredients)}.</p><h3>Go gently</h3><p>${escapeHTML(r.caution)}</p><div class="notice warn">Stop using a product if it causes a reaction. Seek a qualified dermatologist for persistent irritation, severe acne or unusual skin changes.</div></div><div class="card"><h3>Product ideas for your routine</h3><p class="small-note">Sample catalogue matches · illustrative prices</p>${matches.map(p=>`<div class="task-row"><span><strong>${escapeHTML(p.name)}</strong><small class="muted" style="display:block">${escapeHTML(p.brand)} · ${money(p.price)}</small></span><button class="button button-ghost" data-action="product-detail" data-id="${p.id}">View</button></div>`).join('')}<p><strong>Budget preference:</strong> ${escapeHTML(a.budget||'No preference')}</p></div></div><div class="button-row"><button class="button button-primary" data-view="dashboard">Open my skincare space →</button><button class="button button-ghost" data-view="assessment">Update assessment</button></div></div></section>`;
  }
  function summaryText() {
    const a=db.assessment,r=getRecommendations(); if(!a) return 'No assessment yet.';
    return `Silky Beauty Enterprise — Skincare summary\nDate: ${new Date(a.created).toLocaleDateString('en-IN')}\nSkin type: ${a.skin}\nSkin tone: ${a.tone||'Not specified'}\nUndertone: ${a.undertone||'Not sure'}\nConcerns: ${(a.concerns||[]).join(', ')||'None selected'}\nMorning: ${r.am.join('; ')}\nEvening: ${r.pm.join('; ')}\nIngredients to consider: ${r.ingredients}\nNote: General cosmetic guidance only, not a medical diagnosis.`;
  }
  async function shareSummary() {
    const text=summaryText();
    if (navigator.share) { try { await navigator.share({title:'My Silky Beauty skincare summary',text}); return; } catch (error) { if (error.name==='AbortError') return; } }
    try { await navigator.clipboard.writeText(text); notify('Summary copied to clipboard.'); }
    catch { const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();notify('Summary copied.'); }
  }
  function downloadReport() {
    if (!db.assessment) return;
    const a=db.assessment,r=getRecommendations();
    const report=`SILKY BEAUTY ENTERPRISE\nYOUR SKIN. YOUR ROUTINE. YOUR GLOW.\n\nSKINCARE SNAPSHOT\nDate: ${new Date(a.created).toLocaleDateString('en-IN')}\nSkin type: ${a.skin}\nSkin tone: ${a.tone}\nUndertone: ${a.undertone}\nReported concerns: ${(a.concerns||[]).join(', ')||'None selected'}\n\nMORNING ROUTINE\n${r.am.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\nEVENING ROUTINE\n${r.pm.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\nINGREDIENTS TO CONSIDER\n${r.ingredients}\n\nGUIDANCE\n${r.caution}\n\nThis is general cosmetic guidance based on self-reported answers, not a medical diagnosis. Patch-test new products. Consult a qualified dermatologist for persistent irritation, severe acne or unusual skin changes.\n\nRegards,\nChandana Sree Yeddula\nSilky Beauty Enterprise\n\nDEMO REPORT — Product prices and catalogue entries are illustrative.`;
    const blob=new Blob([report],{type:'text/plain;charset=utf-8'});downloadBlob(blob,'silky-beauty-skincare-report.txt');notify('Report downloaded as a text file.');
  }
  function downloadBlob(blob,name) { const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url); }
  function makeTasks(time) {
    const r=getRecommendations(); if(!r) return;
    (time==='AM'?r.am:r.pm).forEach(title=>{if(!db.tasks.some(t=>t.title===title&&t.time===time&&!t.done))db.tasks.push({id:Date.now()+Math.random(),title,due:today(),time,done:false});});
    persist();notify(`${time} routine added to tasks.`);
  }
  function renderDashboard(section='Overview') {
    app.dataset.view='dashboard';
    const favs=db.products.filter(p=>db.favorites.includes(p.id));
    app.innerHTML=`<section class="app-page"><div class="app-container"><div class="page-head"><div><p class="eyebrow">YOUR PERSONAL SPACE · LOCAL DEMO</p><h1>Hello, ${escapeHTML(db.user?.name||'Glow getter')} ✿</h1><p class="muted">A calm place to keep your skincare routine in view.</p></div><div class="button-row"><button class="button button-ghost" data-action="demo-login">Demo sign in</button><button class="button button-primary" data-view="assessment">＋ New assessment</button></div></div><div class="layout"><aside class="side-nav">${['Overview','Skin profile','Assessment results','Routine & tasks','Favourites','My notes','Uploaded images','Settings'].map(s=>`<button class="${section===s?'active':''}" data-action="dashboard-section" data-section="${s}">${s}</button>`).join('')}<button data-action="logout">Log out</button><button data-view="admin">Admin demo →</button></aside><div id="dashboard-content">${dashboardContent(section,favs)}</div></div></div></section>`;
  }
  function dashboardContent(section,favs) {
    if(section==='Overview') return `<div class="stats"><div class="stat"><small>Assessments</small><strong>${db.history.length}</strong></div><div class="stat"><small>Saved products</small><strong>${db.favorites.length}</strong></div><div class="stat"><small>Tasks completed</small><strong>${db.tasks.filter(t=>t.done).length}/${db.tasks.length}</strong></div></div><div class="card"><p class="eyebrow">LATEST SNAPSHOT</p><h3>${db.assessment?`${escapeHTML(db.assessment.skin)} skin profile`:'Your skin story starts here'}</h3><p class="muted">${db.assessment?`Last assessment: ${new Date(db.assessment.created).toLocaleDateString('en-IN')}`:'Take a quick assessment to receive your first routine.'}</p><div class="button-row"><button class="button button-primary" data-view="${db.assessment?'results':'assessment'}">${db.assessment?'View my results':'Start assessment'} →</button></div></div><div class="card" style="margin-top:16px"><h3>Today's tasks</h3>${taskMarkup(db.tasks.filter(t=>t.due<=today()).slice(0,5))}<button class="button button-ghost" data-action="dashboard-section" data-section="Routine & tasks">Manage tasks</button></div><div class="card" style="margin-top:16px"><h3>Previous assessments</h3>${db.history.slice(0,5).map(a=>`<div class="task-row"><span>${escapeHTML(a.skin)} · ${new Date(a.created).toLocaleDateString('en-IN')}</span><button class="button button-ghost" data-action="load-history" data-id="${a.id}">View</button></div>`).join('')||'<p class="muted">Your previous assessments will appear here.</p>'}</div>`;
    if(section==='Skin profile'||section==='Assessment results') return `<div class="card"><h3>${section}</h3>${db.assessment?`<p><strong>Skin type:</strong> ${escapeHTML(db.assessment.skin)}<br><strong>Skin tone:</strong> ${escapeHTML(db.assessment.tone)}<br><strong>Undertone:</strong> ${escapeHTML(db.assessment.undertone)}<br><strong>Concerns:</strong> ${escapeHTML((db.assessment.concerns||[]).join(', ')||'None selected')}</p><button class="button button-primary" data-view="results">View full report</button> <button class="button button-ghost" data-view="assessment">Reassess</button>`:'<p>No assessment yet.</p><button class="button button-primary" data-view="assessment">Begin assessment</button>'}</div>`;
    if(section==='Routine & tasks') return `<div class="card"><h3>My tasks</h3><form id="task-form" class="form-grid"><div class="field"><label for="task-title">Task name</label><input id="task-title" required placeholder="e.g. Apply sunscreen"></div><div class="field"><label for="task-due">Due date</label><input id="task-due" type="date" value="${today()}"></div><div class="field"><label for="task-time">Schedule</label><select id="task-time"><option>AM</option><option>PM</option><option>Anytime</option></select></div><div class="field" style="display:flex;align-items:end"><button class="button button-primary">Add task +</button></div></form><div class="button-row">${['Today','Upcoming','Completed','All'].map(f=>`<button class="button button-ghost" data-action="task-filter" data-filter="${f}">${f}</button>`).join('')}</div>${taskMarkup(filterTasks())}</div>`;
    if(section==='Favourites') return `<div class="card"><h3>Favourite products</h3><div class="product-grid">${favs.map(productCard).join('')||'<p class="muted">Save products from the catalogue to see them here.</p>'}</div><button class="button button-ghost" data-view="products">Explore products</button></div>`;
    if(section==='My notes') return `<div class="card"><h3>My skincare notes</h3><form id="note-form"><div class="field"><label for="note-text">Note</label><textarea id="note-text" required placeholder="How is your skin feeling today?"></textarea></div><button class="button button-primary">Save note</button></form>${db.notes.slice().reverse().map(n=>`<div class="note-row"><div><strong>${escapeHTML(n.text)}</strong><div class="small-note">${new Date(n.date).toLocaleString('en-IN')}</div></div><button class="button button-ghost" data-action="edit-note" data-id="${n.id}">Edit</button><button class="button button-ghost" data-action="delete-note" data-id="${n.id}">Delete</button></div>`).join('')||'<p class="muted">Your notes will appear here.</p>'}</div>`;
    if(section==='Uploaded images') return `<div class="card"><h3>Uploaded images</h3><p>In this prototype, the optional image is only previewed during assessment and is not uploaded to cloud storage or saved to your profile.</p><p class="muted">No persistent image is stored.</p></div>`;
    return `<div class="card"><h3>Settings</h3><p><strong>Account mode:</strong> ${escapeHTML(db.user?.mode||'Guest demo')}</p><p>Demo information is saved in this browser only.</p><div class="button-row"><button class="button button-ghost" data-action="export-data">Export demo data (JSON)</button><button class="button button-ghost" data-action="clear-data">Clear local demo data</button></div><p class="small-note">For real customer accounts, use secure authentication and a server-side database.</p></div>`;
  }
  function filterTasks() { return db.tasks.filter(t=>taskFilter==='All'||(taskFilter==='Today'&&!t.done&&t.due<=today())||(taskFilter==='Upcoming'&&!t.done&&t.due>today())||(taskFilter==='Completed'&&t.done)); }
  function taskMarkup(tasks) { return tasks.map(t=>`<div class="task-row ${t.done?'done':''}"><input type="checkbox" aria-label="Mark task complete" ${t.done?'checked':''} data-action="toggle-task" data-id="${t.id}"><span>${escapeHTML(t.title)}<small class="muted" style="display:block">${escapeHTML(t.time)} · ${escapeHTML(t.due||'No due date')}</small></span><button class="button button-ghost" data-action="edit-task" data-id="${t.id}">Edit</button><button class="button button-ghost" data-action="delete-task" data-id="${t.id}">×</button></div>`).join('')||'<div class="empty">Nothing here yet. Add a task to get started.</div>'; }
  function addTask(event) { event.preventDefault();db.tasks.push({id:Date.now(),title:$('#task-title').value,due:$('#task-due').value,time:$('#task-time').value,done:false});persist();renderDashboard('Routine & tasks');notify('Task added.'); }
  function toggleTask(id) { const task=db.tasks.find(t=>t.id===Number(id));if(task)task.done=!task.done;persist();renderDashboard('Routine & tasks'); }
  function editTask(id) { const task=db.tasks.find(t=>t.id===Number(id));if(!task)return;const title=prompt('Edit task name',task.title);if(title!==null&&title.trim()){task.title=title.trim();persist();renderDashboard('Routine & tasks');} }
  function deleteTask(id) { db.tasks=db.tasks.filter(t=>t.id!==Number(id));persist();renderDashboard('Routine & tasks');notify('Task deleted.'); }
  function addNote(event) { event.preventDefault();db.notes.push({id:Date.now(),text:$('#note-text').value,date:new Date().toISOString()});persist();renderDashboard('My notes');notify('Note saved.'); }
  function editNote(id) { const note=db.notes.find(n=>n.id===Number(id));if(!note)return;const text=prompt('Edit note',note.text);if(text!==null&&text.trim()){note.text=text.trim();note.date=new Date().toISOString();persist();renderDashboard('My notes');} }
  function deleteNote(id) { if(confirm('Delete this note?')){db.notes=db.notes.filter(n=>n.id!==Number(id));persist();renderDashboard('My notes');} }
  function demoLogin() { const name=prompt('Enter a display name for demo mode','Demo Customer');if(name===null)return;db.user={name:name.trim()||'Demo Customer',email:'',mode:'demo'};persist();renderDashboard();notify('Demo session ready.'); }
  function logout() { db.user=null;persist();setView('home');notify('Logged out of demo session.'); }
  function exportData() { downloadBlob(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),'silky-beauty-demo-data.json'); }
  function renderContact() {
    app.dataset.view='contact';
    app.innerHTML=`<section class="app-page"><div class="app-container" style="max-width:850px"><p class="eyebrow">WE'D LOVE TO HEAR FROM YOU</p><h1 style="font:44px 'Playfair Display',Georgia,serif">Let's talk beauty.</h1><p class="muted">Send a demo enquiry. No email service is connected; submissions are stored in this browser.</p><div class="card"><form id="contact-form"><div class="form-grid"><div class="field"><label for="contact-name">Name *</label><input id="contact-name" required></div><div class="field"><label for="contact-email">Email *</label><input id="contact-email" type="email" required></div><div class="field"><label for="contact-phone">Phone (optional)</label><input id="contact-phone" type="tel"></div><div class="field"><label for="contact-category">Enquiry category</label><select id="contact-category"><option>Product Enquiry</option><option>Skincare Guidance</option><option>Technical Support</option><option>Business Partnership</option><option>Other</option></select></div></div><div class="field"><label for="contact-subject">Subject *</label><input id="contact-subject" required></div><div class="field"><label for="contact-message">Message *</label><textarea id="contact-message" required></textarea></div><button class="button button-primary">Submit enquiry →</button></form></div><p class="small-note">Business email, phone, address and social links are intentionally not invented. Add genuine details before launch.</p></div></section>`;
    $('#contact-form').addEventListener('submit',event=>{event.preventDefault();db.enquiries.push({id:Date.now(),name:$('#contact-name').value,email:$('#contact-email').value,phone:$('#contact-phone').value,category:$('#contact-category').value,subject:$('#contact-subject').value,message:$('#contact-message').value,date:new Date().toISOString()});persist();event.target.reset();notify('Enquiry saved in this browser demo.');});
  }
  function renderAdmin(tab='Overview') {
    app.dataset.view='admin';
    app.innerHTML=`<section class="app-page"><div class="app-container"><div class="admin-bar"><div><span class="demo-tag">DEMO ADMIN · NOT SECURE AUTH</span><h2>Silky Beauty Console</h2></div><button class="button button-ghost" data-view="home" style="color:white;border-color:#87716b">View website ↗</button></div><div class="page-head"><div><p class="eyebrow">PROTOTYPE CONTROLS</p><h1>Manage the experience.</h1><p class="muted">Changes save in this browser only. Add secure role-based access before production.</p></div></div><div class="side-nav">${['Overview','Products','Website content','Enquiries','Analytics','Settings'].map(s=>`<button class="${tab===s?'active':''}" data-action="admin-tab" data-tab="${s}">${s}</button>`).join('')}</div><div id="admin-content" style="margin-top:18px">${adminContent(tab)}</div></div></section>`;
  }
  function adminContent(tab) {
    if(tab==='Overview') return `<div class="stats"><div class="stat"><small>Catalogue items</small><strong>${db.products.length}</strong></div><div class="stat"><small>Assessments</small><strong>${db.history.length}</strong></div><div class="stat"><small>Enquiries</small><strong>${db.enquiries.length}</strong></div></div><div class="card"><h3>Admin quick actions</h3><p>Manage the demo product catalogue, edit landing copy, review enquiries and export data.</p><div class="button-row"><button class="button button-primary" data-action="admin-tab" data-tab="Products">Manage products</button><button class="button button-ghost" data-action="admin-tab" data-tab="Website content">Edit website copy</button><button class="button button-ghost" data-action="export-enquiries">Export enquiries CSV</button></div></div>`;
    if(tab==='Products') return `<div class="card"><h3>Add a product</h3><form id="product-form" class="form-grid"><div class="field"><label for="admin-name">Product name *</label><input id="admin-name" required></div><div class="field"><label for="admin-brand">Brand *</label><input id="admin-brand" required></div><div class="field"><label for="admin-category">Category</label><select id="admin-category"><option>Cleanser</option><option>Moisturizer</option><option>Sunscreen</option><option>Serum</option><option>Lip care</option><option>Body care</option></select></div><div class="field"><label for="admin-price">Demo price (₹)</label><input id="admin-price" type="number" min="0" value="399"></div><div class="field"><label for="admin-types">Skin types (comma separated)</label><input id="admin-types" value="Dry, Normal"></div><div class="field"><label for="admin-ingredients">Key ingredients</label><input id="admin-ingredients"></div><div class="field"><label for="admin-description">Description</label><textarea id="admin-description"></textarea></div><div class="field"><label for="admin-style">Visual style</label><select id="admin-style"><option>cleanser</option><option>serum</option><option>jar</option><option>sun</option></select></div><div class="field" style="grid-column:1/-1"><button class="button button-primary">Add product</button></div></form></div><div class="card" style="margin-top:16px"><h3>Current catalogue</h3>${db.products.map(p=>`<div class="task-row"><span><strong>${escapeHTML(p.name)}</strong><small class="muted" style="display:block">${escapeHTML(p.brand)} · ${money(p.price)} · ${escapeHTML(p.category)}</small></span><button class="button button-ghost" data-action="edit-product" data-id="${p.id}">Edit</button><button class="button button-ghost" data-action="delete-product" data-id="${p.id}">Archive</button></div>`).join('')}<div class="button-row"><button class="button button-ghost" data-action="export-products">Export catalogue CSV</button></div></div>`;
    if(tab==='Website content') return `<div class="card"><h3>Landing page content</h3><div class="field"><label for="admin-hero">Hero headline</label><input id="admin-hero" value="${escapeHTML(db.settings.hero)}"></div><div class="field"><label for="admin-subtitle">Hero subtitle</label><textarea id="admin-subtitle">${escapeHTML(db.settings.subtitle)}</textarea></div><button class="button button-primary" data-action="save-content">Save website content</button><p class="small-note">Changes apply to the home page after refresh/re-render.</p></div>`;
    if(tab==='Enquiries') return `<div class="card"><h3>Contact enquiries</h3><div class="button-row"><button class="button button-ghost" data-action="export-enquiries">Export CSV</button></div>${db.enquiries.map(e=>`<div class="enquiry-row"><div><strong>${escapeHTML(e.subject)}</strong><div class="small-note">${escapeHTML(e.name)} · ${escapeHTML(e.email)} · ${escapeHTML(e.category)} · ${new Date(e.date).toLocaleString('en-IN')}</div><p>${escapeHTML(e.message)}</p></div><button class="button button-ghost" data-action="delete-enquiry" data-id="${e.id}">Delete</button></div>`).join('')||'<div class="empty">No enquiries submitted in this browser.</div>'}</div>`;
    if(tab==='Analytics') return `<div class="three-cards"><div class="card"><h3>Assessments</h3><p style="font:35px 'Playfair Display',Georgia,serif">${db.history.length}</p><p class="muted">Stored demo assessment records</p></div><div class="card"><h3>Skin types</h3>${['Dry','Oily','Combination','Normal','Sensitive','Not sure'].map(s=>`<p>${s}<strong style="float:right">${db.history.filter(a=>a.skin===s).length}</strong></p>`).join('')}</div><div class="card"><h3>Product favourites</h3><p style="font:35px 'Playfair Display',Georgia,serif">${db.favorites.length}</p><p class="muted">Current browser demo</p></div></div>`;
    return `<div class="card"><h3>Prototype settings</h3><p><strong>Data storage:</strong> browser localStorage</p><p><strong>Authentication:</strong> demo-only; no password handling</p><p><strong>Image storage:</strong> local temporary preview; no cloud bucket configured</p><p><strong>Email:</strong> not configured; contact form saves locally</p><p><strong>Report:</strong> downloads TXT; PDF generation is not configured</p><p><strong>Database:</strong> none; local demo only</p><div class="button-row"><button class="button button-ghost" data-action="export-data">Export all demo data</button></div></div>`;
  }
  function addProduct(event) {
    event.preventDefault();
    db.products.push({id:Date.now(),name:$('#admin-name').value,brand:$('#admin-brand').value,category:$('#admin-category').value,price:Number($('#admin-price').value)||0,types:$('#admin-types').value.split(',').map(s=>s.trim()).filter(Boolean),ingredients:$('#admin-ingredients').value||'Not specified',description:$('#admin-description').value||'Demo catalogue entry.',style:$('#admin-style').value});
    persist();renderAdmin('Products');notify('Product added.');
  }
  function editProduct(id) {
    const p=db.products.find(item=>item.id===Number(id));if(!p)return;
    const name=prompt('Edit product name',p.name);if(name===null)return;
    const price=prompt('Edit demo price in ₹',p.price);p.name=name.trim()||p.name;
    if(price!==null&&price!==''&&!Number.isNaN(Number(price)))p.price=Number(price);
    persist();renderAdmin('Products');renderFeatured();notify('Product updated.');
  }
  function deleteProduct(id) { if(confirm('Archive this product from the demo catalogue?')){db.products=db.products.filter(p=>p.id!==Number(id));db.favorites=db.favorites.filter(f=>f!==Number(id));persist();renderAdmin('Products');renderFeatured();notify('Product archived.');} }
  function saveContent() { db.settings.hero=$('#admin-hero').value;db.settings.subtitle=$('#admin-subtitle').value;persist();notify('Website content saved.'); }
  function exportCSV(filename, rows) { const csv=rows.map(row=>row.map(value=>`"${String(value??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),filename); }
  function exportProducts() { exportCSV('silky-beauty-products.csv',[['Name','Brand','Category','Price INR','Skin types','Ingredients','Description'],...db.products.map(p=>[p.name,p.brand,p.category,p.price,p.types.join('; '),p.ingredients,p.description])]); }
  function exportEnquiries() { exportCSV('silky-beauty-enquiries.csv',[['Name','Email','Phone','Category','Subject','Message','Date'],...db.enquiries.map(e=>[e.name,e.email,e.phone,e.category,e.subject,e.message,e.date])]); }
  function deleteEnquiry(id) { db.enquiries=db.enquiries.filter(e=>e.id!==Number(id));persist();renderAdmin('Enquiries'); }
  function loadHistory(id) { const a=db.history.find(item=>item.id===Number(id));if(a){db.assessment={...a};persist();renderResults();} }

  function runAction(action,data) {
    switch(action) {
      case 'product-detail': showProduct(data.id); break;
      case 'close-modal': closeModal(); break;
      case 'toggle-favorite': toggleFavorite(data.id); break;
      case 'add-routine': addRoutine(data.id); break;
      case 'pick-answer': answers[data.key]=data.value; renderAssessmentStep(); break;
      case 'toggle-concern': answers.concerns=answers.concerns.includes(data.value)?answers.concerns.filter(x=>x!==data.value):[...answers.concerns,data.value]; renderAssessmentStep(); break;
      case 'remove-photo': photoPreview=''; renderAssessmentStep(); break;
      case 'save-draft': db.draft={...answers};persist();notify('Assessment draft saved in this browser.');break;
      case 'assessment-back': assessmentStep=Math.max(0,assessmentStep-1);renderAssessmentStep();break;
      case 'assessment-next': assessmentStep=Math.min(steps.length-1,assessmentStep+1);renderAssessmentStep();break;
      case 'submit-assessment': submitAssessment();break;
      case 'download-report': downloadReport();break;
      case 'share-summary': shareSummary();break;
      case 'make-tasks': makeTasks(data.time);break;
      case 'dashboard-section': renderDashboard(data.section);break;
      case 'task-filter': taskFilter=data.filter;renderDashboard('Routine & tasks');break;
      case 'toggle-task': toggleTask(data.id);break;
      case 'edit-task': editTask(data.id);break;
      case 'delete-task': deleteTask(data.id);break;
      case 'edit-note': editNote(data.id);break;
      case 'delete-note': deleteNote(data.id);break;
      case 'demo-login': demoLogin();break;
      case 'logout': logout();break;
      case 'export-data': exportData();break;
      case 'clear-data': if(confirm('Clear all local demo data?')){localStorage.removeItem(STORAGE_KEY);db=emptyState();renderDashboard();notify('Local demo data cleared.');}break;
      case 'admin-tab': renderAdmin(data.tab);break;
      case 'edit-product': editProduct(data.id);break;
      case 'delete-product': deleteProduct(data.id);break;
      case 'save-content': saveContent();break;
      case 'export-products': exportProducts();break;
      case 'export-enquiries': exportEnquiries();break;
      case 'delete-enquiry': deleteEnquiry(data.id);break;
      case 'load-history': loadHistory(data.id);break;
    }
  }
  // Forms are attached after each screen is rendered.
  const originalRenderDashboard = renderDashboard;
  renderDashboard = function(section='Overview') {
    originalRenderDashboard(section);
    const taskForm=$('#task-form'); if(taskForm)taskForm.addEventListener('submit',addTask);
    const noteForm=$('#note-form'); if(noteForm)noteForm.addEventListener('submit',addNote);
  };
  const originalRenderAdmin = renderAdmin;
  renderAdmin = function(tab='Overview') {
    originalRenderAdmin(tab);
    const productForm=$('#product-form');if(productForm)productForm.addEventListener('submit',addProduct);
  };
  bindGlobal();
  renderFeatured();
})();
