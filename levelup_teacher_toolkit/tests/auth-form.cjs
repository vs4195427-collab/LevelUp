const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const src=html.split('  <script>\n',2)[1].split('  </script>',1)[0];
const events={},elements={},storage={};
function node(){return {value:'',innerHTML:'',textContent:'',disabled:false,dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},addEventListener(){},focus(){},querySelector(){return node()},querySelectorAll(){return []},remove(){},replaceWith(){},cloneNode(){return node()}}}
const document={body:{classList:{add(){},remove(){},contains(){return false},toggle(){}},dataset:{},appendChild(){}},activeElement:{focus(){}},createElement:node,getElementById(id){return elements[id]??=node()},addEventListener(k,f){(events[k]??=[]).push(f)},querySelectorAll(){return []}};
const ctx=vm.createContext({window:{LEVELUP_SUPABASE:{url:'https://mock.supabase.co',publishableKey:'sb_publishable_test'},scrollTo(){}},document,location:{reload(){}},console,Math,Date,localStorage:{getItem(){return null},setItem(){}},sessionStorage:{getItem(k){return storage[k]},setItem(k,v){storage[k]=v},removeItem(k){delete storage[k]}},setInterval,clearInterval,setTimeout,clearTimeout});
for(const file of [src,fs.readFileSync(path.join(root,'design.js'),'utf8'),fs.readFileSync(path.join(root,'ux.js'),'utf8'),fs.readFileSync(path.join(root,'account.js'),'utf8')])vm.runInContext(file,ctx);
vm.runInContext('uxEnsureState();showToast=()=>{};',ctx);
async function submit(mode,role,id='teacher-u'){
  const form={id:'accountForm',dataset:{mode},querySelector(){return {disabled:false}}};
  document.getElementById('accountRole').value=role;document.getElementById('accountEmail').value=`${id}@example.org`;document.getElementById('accountPassword').value='a-strong-pass';document.getElementById('accountName').value='Teacher Example';
  for(const fn of events.submit||[])await fn({target:form,preventDefault(){}});
}
(async()=>{
  let signup,signin,signouts=0,storedRole='teacher';
  storage.levelup_account='teacher-u';
  const client={
    auth:{async signUp(v){signup=v;return {data:{user:{id:'teacher-u'},session:{access_token:'testing'}},error:null}},async signInWithPassword(v){signin=v;return {data:{user:{id:'teacher-u'},session:{access_token:'testing'}},error:null}},async signOut(){signouts++;return {error:null}}},
    from(){return {select(){return {eq(){return {async single(){return {data:{role:storedRole,display_name:'Teacher Example',student_data:storedRole==='student'?{id:999,name:'Student Example'}:null,invite_code:null,teacher_id:null},error:null}}}}}}}},
    async rpc(){return {error:null}}
  };
  ctx.window.__mockClient=client;
  vm.runInContext('accountClient=window.__mockClient',ctx);
  vm.runInContext("accountGate('', 'signup')",ctx);
  await submit('signup','teacher');
  assert.equal(signup.email,'teacher-u@example.org');assert.equal(signup.options.data.role,'teacher');
  assert.equal(signup.options.data.invite_code,'');
  assert.equal(vm.runInContext('state.auth.role',ctx),'teacher');
  assert.equal(vm.runInContext('accountReady',ctx),true);
  vm.runInContext("accountGate('', 'signin')",ctx);
  await submit('signin','student');
  assert.equal(signin.password,'a-strong-pass');assert.equal(signouts,1);
  assert.match(elements.accountMessage.textContent,/registered as a teacher/);
  assert.equal(vm.runInContext('accountProfile',ctx),null);
  console.log('Account sign-up metadata, role routing, and mismatched-role rejection passed');
})().catch(e=>{console.error(e);process.exitCode=1});
