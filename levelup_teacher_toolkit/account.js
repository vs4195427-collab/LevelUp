/* Supabase authenticates accounts; classroom work remains device-local. */
const accountConfig = window.LEVELUP_SUPABASE || {};
const accountConfigured = Boolean(accountConfig.url && accountConfig.publishableKey);
let accountClient, accountProfile, accountReady = !accountConfigured, profileReturnFocus;
const accountBaseRender = renderApp;
renderApp = function(){
  if(accountConfigured && !accountReady) return;
  if(accountProfile) {
    state.auth.role = accountProfile.role;
    if(accountProfile.role==='student') state.auth.studentId=accountProfile.student_data.id;
  }
  accountBaseRender(); accountControls();
};
function accountControls(){
  const button=document.getElementById('roleSwitchModalBtn');
  if(button){button.innerHTML=accountProfile ? `${accountProfile.role==='teacher'?'Teacher':'Student'} · Log out` : 'Sign in';button.title=accountProfile?'Log out of your account':'Teacher or student sign in';}
  const avatar=document.getElementById('avatarProfileBtn');
  if(avatar){avatar.style.setProperty('display','flex','important');avatar.title='Open my profile';avatar.textContent=(accountProfile?.display_name||state.classInfo.teacher||'L').slice(0,1);}
}
function accountGate(message='',mode='signin'){
  // The app stays hidden until Supabase has verified this session and role.
  accountReady=false;
  document.body.classList.add('account-lock');
  let gate=document.getElementById('accountGate');
  if(!gate){gate=document.createElement('div');gate.id='accountGate';document.body.appendChild(gate);}
  gate.hidden=false;
  const isSignup=mode==='signup', isSetup=mode==='setup', extra=isSignup||isSetup;
  const heading=isSignup?'Create your account':isSetup?'Complete your account':'Welcome to LevelUp';
  const intro=isSignup?'Choose your role and start teaching or learning.':isSetup?'For accounts created before the new sign-in system.':'Sign in to continue your teaching or learning journey.';
  const nameField=extra?'<div class="ux-field"><label for="accountName">Full name</label><input id="accountName" class="ux-input" type="text" required minlength="2" maxlength="120" autocomplete="name" placeholder="Your full name"></div>':'';
  const links=isSignup||isSetup?'<button type="button" class="account-link" data-account-mode="signin">Already have an account? Sign in</button>':
    '<button type="button" class="account-link" data-account-mode="signup">New to LevelUp? Create an account</button><button type="button" class="account-link account-legacy-link" data-account-mode="setup">Already registered but cannot access your account?</button>';
  const status=message||(!accountConfigured?'Add your Supabase URL and publishable key in supabase-config.js to enable real sign-in.':'');
  gate.innerHTML=`<section class="ux-panel account-card" aria-labelledby="accountTitle">
    <div class="account-brand"><span class="school-welcome-owl" aria-hidden="true">${schoolIcon('owl')}</span><span><strong>LevelUp</strong><small>Teacher Toolkit</small></span></div>
    <span class="ux-kicker">YOUR LEARNING COMMUNITY</span><h1 id="accountTitle">${heading}</h1><p class="ux-muted">${intro}</p>
    <div class="account-modes" role="group" aria-label="Account action"><button type="button" class="account-mode ${isSignup?'':'active'}" data-account-mode="signin" ${!isSignup?'aria-current="true"':''}>Log in</button><button type="button" class="account-mode ${isSignup?'active':''}" data-account-mode="signup" ${isSignup?'aria-current="true"':''}>Sign up</button></div>
    <form id="accountForm" data-mode="${mode}">
    ${nameField}<div class="ux-field"><label for="accountRole">I am a</label><select id="accountRole" class="ux-select" required><option value="teacher">Teacher</option><option value="student">Student</option></select><span class="ux-small ux-muted">Your role determines which part of LevelUp opens.</span></div>
    <div class="ux-field"><label for="accountEmail">Email address</label><input id="accountEmail" class="ux-input" type="email" required autocomplete="email" inputmode="email" maxlength="254" placeholder="you@example.com"></div>
    <div class="ux-field"><div class="account-label-row"><label for="accountPassword">Password</label><button type="button" class="account-password-toggle" data-account-password-toggle aria-label="Show password" aria-pressed="false">Show</button></div><input id="accountPassword" class="ux-input" type="password" required minlength="${isSignup?'6':'1'}" autocomplete="${isSignup?'new-password':'current-password'}" placeholder="${isSignup?'At least 6 characters':'Enter your password'}"></div>
    <button class="ux-action account-primary" type="submit" ${accountConfigured?'':'disabled'}>${isSignup?'Create account':isSetup?'Complete setup':'Log in'} →</button></form>
    <div id="accountMessage" class="account-message" role="status" aria-live="polite">${escapeHtml(status)}</div>
    <div class="account-links">${links}</div>
    ${accountConfigured?'':'<div class="account-options"><button class="ux-action secondary" data-account-demo="teacher">Teacher demo</button><button class="ux-action secondary" data-account-demo="student">Student demo</button></div>'}
    <button type="button" class="account-theme-switch" data-account-theme>☀ / ☾ Switch theme</button>
    <p class="account-footnote">Your password is handled by Supabase Auth, never stored in the website.</p>
  </section>`;
  gate.querySelector('#accountEmail')?.focus();
}
function accountUnlock(){document.body.classList.remove('account-lock');const gate=document.getElementById('accountGate');if(gate)gate.hidden=true;accountReady=true;renderApp();}
async function accountLoad(user){
  const {data,error}=await accountClient.from('levelup_accounts').select('user_id, role, display_name, student_data, invite_code, teacher_id').eq('user_id',user.id).single();
  if(error||!data)throw new Error('Could not load your account profile. Check that the latest Supabase setup SQL has been run.');
  if(!['teacher','student'].includes(data.role))throw new Error('This account does not have a valid school role.');
  if(data.role==='student'&&(!data.student_data||!Number.isInteger(data.student_data.id)||!data.student_data.name))throw new Error('Your student profile has not been linked yet. Contact your teacher.');
  accountProfile=data;
  if(sessionStorage.getItem('levelup_account')!==user.id){sessionStorage.setItem('levelup_account',user.id);location.reload();return false;}
  state.auth.role=data.role;
  if(data.role==='teacher'){state.classInfo.teacher=data.display_name;}
  else {
    // Never make the demo roster or another learner's local data available to a signed-in student.
    const cached=state.students.find(s=>s.id===data.student_data.id);
    const learner={rBase:'R1',rCurr:'R1',mBase:'M1',mCurr:'M1',rScore:0,mScore:0,grade:'',notes:'',interventions:[],...data.student_data};
    state.students=[learner];state.auth.studentId=learner.id;
    const classId='my-learning';state.activeClassId=classId;
    state.classesCatalog={[classId]:{...state.classInfo,id:classId,students:[learner]}};
    state.ux={assignments:[],submissions:[],projects:cached?.id===learner.id?(state.ux?.projects||[]).filter(p=>p.studentId===learner.id):[],studentPage:'home'};
    state.attendance=createInitialState().attendance;
    // Sample attendance is not evidence for a real learner.
    state.attendance.records={};
  }
  return true;
}
async function accountLogout(){
  if(accountClient){const {error}=await accountClient.auth.signOut();if(error){showToast('Online logout failed. '+error.message);return;}}
  sessionStorage.removeItem('levelup_account');accountProfile=null;accountReady=false;stopDiagnosticTimer();
  state=createInitialState();uxEnsureState();accountGate('You have logged out.');
}
openAuthModal=()=>{if(accountProfile)accountLogout();else accountGate();};
const profileOpenBase=openStudentModal,profileCloseBase=closeStudentModal;
openStudentModal=function(id){
  if(accountProfile?.role==='student'&&id!==accountProfile.student_data.id)return;
  profileReturnFocus=document.activeElement;profileOpenBase(id);
  const content=document.getElementById('studentModalContent');
  if(!content)return;
  content.setAttribute('role','dialog');content.setAttribute('aria-modal','true');content.setAttribute('aria-label','Student learning profile');
  const preview=document.getElementById('modalStudentLoginBtn');if(preview&&accountConfigured)preview.remove();
  document.getElementById('closeStudentModalBtn')?.setAttribute('aria-label','Close student profile');
  const growth=document.getElementById('modalTrackReportBtn');if(growth){growth.replaceWith(growth.cloneNode(true));document.getElementById('modalTrackReportBtn').onclick=()=>{closeStudentModal();state.trackView.mode='student';state.trackView.selectedStudentId=id;state.activeTab='reports';legacyRenderApp();uxNav();};}
  document.getElementById('closeStudentModalBtn')?.focus();
};
closeStudentModal=function(){profileCloseBase();profileReturnFocus?.focus();};
document.addEventListener('keydown',e=>{
  const content=document.getElementById('studentModalContent');if(!content||document.getElementById('studentModalOverlay').classList.contains('hidden'))return;
  if(e.key==='Escape'){closeStudentModal();return;}
  if(e.key==='Tab'){const nodes=[...content.querySelectorAll('button,input,select,textarea,a[href]')].filter(x=>!x.disabled);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
});
document.addEventListener('click',e=>{
  const btn=e.target.closest('#roleSwitchModalBtn,[data-ux-signout],#avatarProfileBtn,[data-account-demo],[data-account-theme],[data-account-mode],[data-account-password-toggle],#modalStudentLoginBtn,#inspectorStudentPortalBtn');if(!btn)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(btn.hasAttribute('data-account-mode')){accountGate('',btn.dataset.accountMode);return;}
  if(btn.hasAttribute('data-account-password-toggle')){const password=document.getElementById('accountPassword');if(!password)return;const showing=password.type==='text';password.type=showing?'password':'text';btn.textContent=showing?'Show':'Hide';btn.setAttribute('aria-label',showing?'Show password':'Hide password');btn.setAttribute('aria-pressed',String(!showing));return;}
  if(btn.id==='avatarProfileBtn'){
    if(state.auth.role==='student'){uxNavigate('profile');return;}
    const content=document.getElementById('studentModalContent'),overlay=document.getElementById('studentModalOverlay');
    profileReturnFocus=btn;content.innerHTML=`<div class="ux-row"><h3>My teacher profile</h3><button id="teacherProfileClose" class="ux-action secondary" aria-label="Close profile">×</button></div><p class="ux-muted" style="margin:20px 0">${escapeHtml(accountProfile?.display_name||state.classInfo.teacher)} · Teacher</p><div class="ux-panel"><h2>${escapeHtml(state.classInfo.school)}</h2><p>${escapeHtml(state.classInfo.className)} · ${state.students.length} learners</p></div><div class="ux-split-actions" style="margin-top:20px"><button id="teacherProfileSettings" class="ux-action">Class settings</button><button id="teacherProfileLogout" class="ux-action secondary">Log out</button></div>`;
    content.setAttribute('role','dialog');content.setAttribute('aria-modal','true');content.setAttribute('aria-label','Teacher profile');overlay.classList.remove('hidden');overlay.classList.add('flex');
    document.getElementById('teacherProfileClose').onclick=closeStudentModal;document.getElementById('teacherProfileSettings').onclick=()=>{closeStudentModal();uxNavigate('settings');};document.getElementById('teacherProfileLogout').onclick=()=>{closeStudentModal();accountLogout();};document.getElementById('teacherProfileClose').focus();return;
  }
  if(btn.hasAttribute('data-account-theme')){state.darkMode=!state.darkMode;applyThemeAndHeaderState();return;}
  if(btn.dataset.accountDemo&&!accountConfigured){state.auth.role=btn.dataset.accountDemo;state.auth.studentId=state.students[0]?.id;state.activeTab='dashboard';uxEnsureState();state.ux.studentPage='home';accountUnlock();return;}
  if(accountConfigured&&(btn.id==='modalStudentLoginBtn'||btn.id==='inspectorStudentPortalBtn'))return;
  if(accountProfile||btn.hasAttribute('data-ux-signout'))accountLogout();else accountGate();
},true);
document.addEventListener('submit',async e=>{
  if(e.target.id!=='accountForm')return;e.preventDefault();const form=e.target,msg=document.getElementById('accountMessage'),submit=form.querySelector('button'),mode=form.dataset.mode;submit.disabled=true;msg.textContent=mode==='signup'?'Creating your account…':mode==='setup'?'Finishing account setup…':'Signing in…';
  try{
    if(!accountClient)throw new Error('Supabase is unavailable. Check your configuration and internet connection.');
    const email=document.getElementById('accountEmail').value.trim(),password=document.getElementById('accountPassword').value;
    let data,error;
    if(mode==='signup'){
      const {data:signupData,error:signupError}=await accountClient.auth.signUp({email,password,options:{data:{
        role:document.getElementById('accountRole').value,
        display_name:document.getElementById('accountName').value.trim(),
        invite_code:''
      }}});
      data=signupData;error=signupError;
      if(error)throw error;
      if(!data.session){msg.textContent='Account created! If email confirmation is enabled in Supabase, confirm your address before logging in. For a demo without verification emails, disable Confirm Email in Supabase Auth settings.';return;}
    }else{
      const result=await accountClient.auth.signInWithPassword({email,password});data=result.data;error=result.error;if(error)throw error;
      if(mode==='setup'){
        const {error:setupError}=await accountClient.rpc('levelup_complete_signup',{
          p_role:document.getElementById('accountRole').value,
          p_display_name:document.getElementById('accountName').value.trim(),
          p_invite_code:''
        });
        if(setupError)throw setupError;
      }
    }
    const selected=document.getElementById('accountRole').value;
    const {data:role,error:roleError}=await accountClient.from('levelup_accounts').select('role').eq('user_id',data.user.id).single();
    if(roleError||role?.role!==selected){await accountClient.auth.signOut();accountProfile=null;throw new Error(roleError?'Your account profile was not found. Run supabase_auth_setup.sql in your Supabase SQL Editor. If you signed up earlier, choose Complete your account.':`This email is registered as a ${role.role}. Select that role to log in.`);}
    if(await accountLoad(data.user))accountUnlock();
  }catch(err){const visibleMessage=document.getElementById('accountMessage');if(visibleMessage)visibleMessage.textContent=err.message||'Unable to sign in.';}finally{submit.disabled=false;}
});
document.addEventListener('DOMContentLoaded',async()=>{
  accountGate(accountConfigured?'Connecting securely…':'');
  if(!accountConfigured)return;
  try{
    const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4';
    await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(new Error('Could not load sign-in. Check your internet connection.'));document.head.appendChild(script);});
    if(!window.supabase?.createClient)throw new Error('The Supabase sign-in library did not initialize. Disable script-blockers or check your connection.');
    accountClient=window.supabase.createClient(accountConfig.url,accountConfig.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data,error}=await accountClient.auth.getUser();
    if(data?.user&&!error){if(await accountLoad(data.user))accountUnlock();}else accountGate(error && error.name!=='AuthSessionMissingError'?error.message:'');
    accountClient.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'){accountReady=false;accountProfile=null;sessionStorage.removeItem('levelup_account');accountGate('You have logged out.');}});
  }catch(err){accountGate(err.message);}
});
const accountThemeBase=applyThemeAndHeaderState;
applyThemeAndHeaderState=function(){accountThemeBase();accountControls();const theme=document.getElementById('themeToggleIcon');if(theme)theme.innerHTML=schoolIcon('star')+'<span>'+(state.darkMode?'Light':'Dark')+'</span>';};
