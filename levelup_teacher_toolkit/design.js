/* Original, scalable pastel illustrations. No icon font, image CDN or runtime dependency. */
const schoolIcons={
 dashboard:'<path fill="#9bbfee" d="M5 24a15 15 0 1 1 30 0v7H5z"/><path fill="#d7e8ff" d="M10 24a10 10 0 0 1 20 0"/><path d="m20 25 8-12"/><circle cx="20" cy="25" r="4" fill="#fff6db"/>',
 people:'<circle cx="15" cy="12" r="6" fill="#c1a2e9"/><path fill="#b895e4" d="M4 32v-3a11 11 0 0 1 22 0v3z"/><circle cx="29" cy="14" r="5" fill="#ffd784"/><path fill="#ffd784" d="M28 24c6-1 9 3 9 8h-7"/>',
 page:'<path fill="#c6a5e5" d="M10 4h15l7 8v24H10z"/><path fill="#e9d9ff" d="M25 4v9h7"/><path d="M15 19h12M15 24h12M15 29h9"/>',
 check:'<path fill="#bda0e6" d="m5 21 9 9 21-22 4 5-25 25L1 26z"/>',
 clock:'<path d="M8 11a15 15 0 1 1-2 17M3 9v10h10"/><path d="M21 10v12l7 4"/><circle cx="21" cy="22" r="2" fill="#9cdccf"/>',
 folder:'<path fill="#ffa993" d="M4 9h12l5 5h15v20H4z"/><path fill="#ffd586" d="M4 16h32l-3 19H6z"/>',
 settings:'<path fill="#c4a1e5" d="m17 3 6 0 1 5 5 2 4-3 4 5-3 4 1 5 5 2-2 6-5-1-4 4v5h-6l-2-5-5-1-4 3-4-5 3-4-1-5-5-2 2-6 5 1 4-4z"/><circle cx="21" cy="20" r="6" fill="#eee0ff"/>',
 calendar:'<rect x="4" y="8" width="32" height="29" rx="5" fill="#faf9ff"/><path fill="#c4a4e5" d="M4 17V12q0-4 5-4h22q5 0 5 4v5z"/><path d="M12 4v8M28 4v8M11 23h3m6 0h3m6 0h1M11 30h3m6 0h3"/>',
 pencil:'<path fill="#ffd587" d="m7 28 19-22 7 6-19 22-10 3z"/><path fill="#ffa6a1" d="m26 6 3-3q3-2 6 1l1 1q3 3 0 6l-3 2z"/><path fill="#fff3d2" d="m7 28 7 6-10 3z"/><path d="m7 28 7 6M24 10l5 4"/>',
 list:'<rect x="3" y="3" width="34" height="34" rx="10" fill="#9cdbde"/><path d="M16 12h13M16 20h13M16 28h13"/><circle cx="10" cy="12" r="1"/><circle cx="10" cy="20" r="1"/><circle cx="10" cy="28" r="1"/>',
 target:'<rect x="3" y="3" width="34" height="34" rx="11" fill="#ffaaa1"/><circle cx="20" cy="20" r="10" fill="#f5d4ec"/><circle cx="20" cy="20" r="5" fill="#caa6e4"/><circle cx="20" cy="20" r="1"/>',
 star:'<path fill="#ffda89" d="m20 3 5 11 12 2-9 9 2 12-10-6-11 6 2-12-9-9 13-2z"/>',
 book:'<path fill="#9cd8d0" d="M8 4h23v31H8q-5-1-5-6V10q0-5 5-6z"/><path fill="#ddf0df" d="M8 29h23v7H8q-6-3 0-7z"/><path d="M8 4v25M14 14q2 3 4 0m5 0q2 3 4 0m-8 7q3 2 5-1"/><path fill="#ffb4ac" d="M11 30v9l4-3 4 3v-9z"/>',
 heart:'<path fill="#ffafa6" d="M20 23C-2 10 12 0 20 9c8-9 22 1 0 14z"/><path fill="#ffe3c9" d="m3 33 5-9q2-3 5-1l7 3h8q3 0 2 3l-9 2 10-3 5-4q4-1 2 3l-9 10H14z"/>',
 cloud:'<path fill="#fffef5" stroke="#c6dce1" d="M5 30q-4-13 8-13 0-15 13-9 6 2 6 10 12-3 11 10-1 4-8 4H8z"/>',
 plane:'<path fill="#c3b8ee" d="M2 15 38 3 26 36 18 24z"/><path fill="#e0dcff" d="m2 15 16 9L38 3 13 19z"/><path d="m18 24 8 12"/>',
 balloon:'<path fill="#ffa79b" d="M20 3C-4 3 2 30 18 32h4C38 30 44 3 20 3z"/><path fill="#ffc6af" stroke="none" d="M12 8q-6 5-5 12l4-3q0-6 5-9z"/><path fill="#f4b1bc" d="m18 32-2 5h8l-2-5"/><path fill="none" d="M20 37q-6 10 1 19t-1 20"/>',
 rocket:'<path fill="#b6c5ee" d="M13 22q-9 0-9 12l11-3M27 22q9 0 9 12l-11-3"/><path fill="#f8f4ee" d="M20 3Q4 14 13 33h14Q36 14 20 3z"/><path fill="#ffa7a7" d="M20 3q-6 5-8 12h16q-2-7-8-12z"/><circle cx="20" cy="22" r="5" fill="#a7d9ea"/><path fill="#ffd57a" d="M15 34q-2 10 5 16 7-6 5-16"/><path fill="#ffac90" d="M18 34v8l2-3 2 3v-8"/>',
 owl:'<path fill="#a6dbd9" d="M6 13 5 2l10 5q6-3 12 0l10-5-1 12q9 26-15 27Q-2 40 6 13z"/><path fill="#c6a5e3" d="M8 19Q-2 24 4 33l7-6m23-8q10 5 4 14l-7-6"/><path fill="#fff9e8" d="M10 15q4-8 11-1 7-7 11 1 7 12-11 15Q3 27 10 15z"/><ellipse fill="#f6dfb6" cx="21" cy="33" rx="10" ry="7"/><circle cx="15" cy="19" r="3" fill="#4e4455"/><circle cx="27" cy="19" r="3" fill="#4e4455"/><path fill="#ffd67d" d="m18 25 3 5 3-5z"/><path d="m15 39-2 4m4-3v3m10-4 2 4m-4-3v3M18 32l-2 2m8-2 2 2"/>',
 person:'<circle cx="20" cy="15" r="10" fill="#c88d66"/><path fill="#51404b" d="M10 16Q5 0 20 3q15 0 10 14l-4-8-5 3-4-4-7 8z"/><path fill="#94c9e3" d="M5 38v-5q2-9 15-9t15 9v5z"/><path fill="#c88d66" d="M17 24v5q3 4 6 0v-5"/><path d="M16 17h.1m8 0h.1m-6 5q2 1 4 0"/>'
};
function schoolIcon(name,cls=''){return `<svg class="school-icon ${cls}" viewBox="${name==='balloon'?'0 0 42 78':name==='rocket'?'0 0 40 52':name==='owl'?'0 0 42 46':name==='cloud'?'0 0 48 40':'0 0 42 42'}" fill="none" stroke="#58465f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${schoolIcons[name]||schoolIcons.star}</svg>`;}
const schoolTabIcons={dashboard:'dashboard',home:'dashboard',classroom:'people',homework:'page',assignments:'page',review:'check',reports:'clock',progress:'clock',resources:'folder',settings:'settings',attendance:'calendar',diagnostic:'target',groups:'people',sheets:'pencil',wonderlab:'rocket',understand:'book',learning:'book',creative:'star',profile:'person',class:'settings'};
function schoolDecor(){return `<div class="school-doodles" aria-hidden="true"><span class="doodle-plane">${schoolIcon('plane')}<svg viewBox="0 0 50 110" class="doodle-trail"><path d="M35 2C-10 35 55 35 27 45S-3 80 15 106" fill="none" stroke="#897a83" stroke-width="1.4" stroke-dasharray="4 5" stroke-linecap="round"/></svg></span><span class="doodle-balloon">${schoolIcon('balloon')}</span><span class="doodle-rocket">${schoolIcon('rocket')}</span><span class="doodle-cloud one">${schoolIcon('cloud')}</span><span class="doodle-cloud two">${schoolIcon('cloud')}</span><span class="doodle-cloud three">${schoolIcon('cloud')}</span><span class="doodle-star one">${schoolIcon('star')}</span><span class="doodle-star two">${schoolIcon('star')}</span><i class="doodle-spark one">✧</i><i class="doodle-spark two">✧</i></div>`;}
function schoolApplyDesign(){
  const student=state.auth.role==='student';
  document.body.dataset.schoolPage=student?'student-'+(state.ux?.studentPage||'home'):state.activeTab;
  const brand=document.querySelector('#brandHomeBtn>div:first-child');if(brand&&!brand.querySelector('svg')){brand.innerHTML=schoolIcon('owl');brand.classList.add('school-brand-mark');}
  const main=document.getElementById('appMainContainer');if(!main)return;
  main.querySelectorAll('.workspace-intro:not([data-school-styled])').forEach(intro=>{intro.dataset.schoolStyled='true';const art=document.createElement('span');art.className='school-page-icon';art.innerHTML=schoolIcon(schoolTabIcons[state.activeTab]||'book');intro.prepend(art);});
  document.querySelectorAll('#mobileBottomNav [data-mobile-tab]').forEach(button=>{const icon=button.querySelector('span');if(icon)icon.innerHTML=schoolIcon(schoolTabIcons[button.dataset.mobileTab]||'star');});
  // The older learning tools receive the same navigation after each render.
  document.querySelectorAll('#appSidebar .nav-tab,#appSidebar .stu-nav-tab').forEach(button=>{const key=button.dataset.tab||button.dataset.studentSection;const icon=button.querySelector('span:first-child');if(icon&&key&&schoolTabIcons[key])icon.innerHTML=schoolIcon(schoolTabIcons[key]);});
}
document.addEventListener('DOMContentLoaded',()=>{
  schoolApplyDesign();
  const main=document.getElementById('appMainContainer');
  if(main&&typeof MutationObserver!=='undefined')new MutationObserver(()=>schoolApplyDesign()).observe(main,{childList:true});
});
