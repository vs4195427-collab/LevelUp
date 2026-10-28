const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const path=require('path');

const source=fs.readFileSync(path.join(__dirname,'..','elevenlabs-widget.js'),'utf8');
const calls=[];
const responses=[
  {ok:true,blob:async()=>new Blob(['audio'])},
  {ok:true,json:async()=>({text:'A bright little story.'})}
];
class FormDataStub{
  constructor(){this.values=[];}
  append(...value){this.values.push(value);}
}
const context=vm.createContext({
  document:{addEventListener(){}},
  window:{
    addEventListener(){},
    LEVELUP_SUPABASE:{url:'https://example.supabase.co',publishableKey:'public-test-key'}
  },
  accountClient:{auth:{getSession:async()=>({data:{session:{access_token:'user-access-token'}},error:null})}},
  fetch:async(...args)=>{calls.push(args);return responses.shift();},
  FormData:FormDataStub,
  Blob,
  URL,
  console
});
vm.runInContext(source,context,{filename:'elevenlabs-widget.js'});

(async()=>{
  vm.runInContext("ELEVEN_CONFIG.voiceId='test-voice'",context);
  const audio=await vm.runInContext("elevenTextToSpeech('Hello, story!')",context);
  assert(audio instanceof Blob);
  assert.equal(calls[0][0],'https://example.supabase.co/functions/v1/elevenlabs');
  assert.equal(calls[0][1].headers.apikey,'public-test-key');
  assert.equal(calls[0][1].headers.Authorization,'Bearer user-access-token');
  assert.deepEqual(JSON.parse(calls[0][1].body),{action:'tts',text:'Hello, story!',voiceId:'test-voice'});
  assert.equal(Object.keys(calls[0][1].headers).some(key=>key.toLowerCase()==='xi-api-key'),false);

  const words=await vm.runInContext("elevenSpeechToText(new Blob(['voice']))",context);
  assert.equal(words,'A bright little story.');
  assert.equal(calls[1][0],'https://example.supabase.co/functions/v1/elevenlabs');
  assert.equal(calls[1][1].headers.Authorization,'Bearer user-access-token');
  assert.deepEqual(calls[1][1].body.values.map(value=>value[0]),['action','file']);
  assert.equal(calls[1][1].body.values[0][1],'stt');
  assert.equal(Object.keys(calls[1][1].headers).some(key=>key.toLowerCase()==='xi-api-key'),false);
  console.log('Authenticated ElevenLabs proxy requests passed without exposing the API key');
})().catch(error=>{console.error(error);process.exitCode=1;});
