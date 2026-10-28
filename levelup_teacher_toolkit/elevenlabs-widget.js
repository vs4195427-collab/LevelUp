// Keep the ElevenLabs key in Supabase Edge Function secrets, never in browser code.
const ELEVEN_CONFIG = {
  apiKey: 'sk_1c1b4139f0539debaa6b28c0c45060f98e9a75e1a769f2f9',
  voiceId: '2NK8h12Jwt5RNkwGLkVa'
};

function elevenHasVoice() {
  return Boolean(ELEVEN_CONFIG.voiceId && !ELEVEN_CONFIG.voiceId.startsWith('YOUR_'));
}

async function elevenProxyRequest(options) {
  const config = window.LEVELUP_SUPABASE;
  if (!config?.url || !config?.publishableKey || typeof accountClient === 'undefined' || !accountClient) {
    throw new Error('not-configured');
  }
  const { data, error } = await accountClient.auth.getSession();
  if (error || !data?.session?.access_token) throw new Error('not-authenticated');
  return fetch(`${config.url.replace(/\/$/, '')}/functions/v1/elevenlabs`, {
    ...options,
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${data.session.access_token}`,
      ...options.headers
    }
  });
}

async function elevenTextToSpeech(text) {
  if (!elevenHasVoice()) throw new Error('not-configured');
  const response = await elevenProxyRequest({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'tts', text, voiceId: ELEVEN_CONFIG.voiceId })
  });
  if (!response.ok) throw new Error('speech-unavailable');
  return response.blob();
}

async function elevenSpeechToText(audioBlob) {
  const formData = new FormData();
  const extension = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
  formData.append('action', 'stt');
  formData.append('file', audioBlob, `story.${extension}`);
  const response = await elevenProxyRequest({ method: 'POST', body: formData });
  if (!response.ok) throw new Error('transcription-unavailable');
  const result = await response.json();
  if (typeof result.text !== 'string' || !result.text.trim()) throw new Error('no-words-found');
  return result.text.trim();
}

function elevenSetStatus(message, stateName = 'ready') {
  const status = document.getElementById('elevenKidStatus');
  if (!status) return;
  status.textContent = message;
  status.dataset.state = stateName;
}

function elevenSetRecordButton(button, recording) {
  button.dataset.recording = recording ? 'true' : 'false';
  const label = button.querySelector('span:last-child');
  if (label) label.textContent = recording ? 'Finish my idea' : 'Say my idea';
  button.classList.toggle('is-recording', recording);
}

let elevenRecorder = null;
let elevenStream = null;
let elevenAudioUrl = null;
let elevenDiscardRecording = false;

async function elevenStartRecording(button) {
  if (typeof accountClient === 'undefined' || !accountClient) {
    elevenSetStatus('Voice story time is still getting ready. You can write your idea for now! 🌈');
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    elevenSetStatus('This device can’t record right now. You can type your story instead! 💛');
    return;
  }
  try {
    elevenStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    elevenRecorder = new MediaRecorder(elevenStream);
    const audioType = elevenRecorder.mimeType;
    const parts = [];
    elevenRecorder.addEventListener('dataavailable', event => {
      if (event.data.size) parts.push(event.data);
    });
    elevenRecorder.addEventListener('stop', async () => {
      elevenStream?.getTracks().forEach(track => track.stop());
      elevenStream = null;
      elevenRecorder = null;
      if (elevenDiscardRecording) {
        elevenDiscardRecording = false;
        return;
      }
      button.disabled = true;
      elevenSetStatus('Turning your words into a story... ✨', 'busy');
      try {
        const words = await elevenSpeechToText(new Blob(parts, { type: audioType || parts[0]?.type || 'audio/webm' }));
        const text = document.getElementById('uxProjectText');
        if (text) {
          text.value = text.value.trim() ? `${text.value.trim()} ${words}` : words;
          text.focus();
        }
        elevenSetStatus('Your words are ready! You did a great job! ⭐', 'success');
      } catch {
        elevenSetStatus('We couldn’t catch those words. Try again, or type your idea! 💛', 'error');
      } finally {
        button.disabled = false;
      }
    });
    elevenRecorder.start();
    elevenSetRecordButton(button, true);
    elevenSetStatus('I’m listening! Tap “Finish my idea” when you’re done. 🎤', 'listening');
  } catch (error) {
    elevenStream?.getTracks().forEach(track => track.stop());
    elevenStream = null;
    const message = error?.name === 'NotAllowedError'
      ? 'Microphone access is off. Ask a grown-up to help turn it on, or type your idea! 💛'
      : 'The microphone isn’t ready just now. You can type your story instead! 🌼';
    elevenSetStatus(message, 'error');
  }
}

document.addEventListener('click', async event => {
  const recordButton = event.target.closest('[data-eleven-record]');
  if (recordButton) {
    if (elevenRecorder?.state === 'recording') {
      elevenSetRecordButton(recordButton, false);
      elevenSetStatus('Finishing your idea... ⭐', 'busy');
      elevenRecorder.stop();
    } else {
      await elevenStartRecording(recordButton);
    }
    return;
  }

  if (elevenRecorder?.state === 'recording' && event.target.closest('[data-ux-nav]')) {
    elevenDiscardRecording = true;
    elevenRecorder.stop();
  }

  const speakButton = event.target.closest('[data-eleven-speak]');
  if (speakButton) {
    const text = document.getElementById('uxProjectText')?.value.trim();
    if (!text) {
      elevenSetStatus('Write a few words first, then we can read them together! 📖');
      return;
    }
    if (typeof accountClient === 'undefined' || !accountClient || !elevenHasVoice()) {
      elevenSetStatus('Story listening is still getting ready. Your words are wonderful just as they are! 🌟');
      return;
    }
    speakButton.disabled = true;
    elevenSetStatus('Getting your story ready to listen to... 🎵', 'busy');
    try {
      const audioBlob = await elevenTextToSpeech(text);
      if (elevenAudioUrl) URL.revokeObjectURL(elevenAudioUrl);
      elevenAudioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(elevenAudioUrl);
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(elevenAudioUrl);
        elevenAudioUrl = null;
      }, { once: true });
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(elevenAudioUrl);
        elevenAudioUrl = null;
      }, { once: true });
      await audio.play();
      elevenSetStatus('Enjoy listening to your story! You made it! ⭐', 'success');
    } catch {
      if (elevenAudioUrl) URL.revokeObjectURL(elevenAudioUrl);
      elevenAudioUrl = null;
      elevenSetStatus('Let’s try story time again in a little while. You can keep writing! 🌈', 'error');
    } finally {
      speakButton.disabled = false;
    }
    return;
  }

  const colorButton = event.target.closest('[data-eleven-color]');
  if (colorButton) {
    const widget = colorButton.closest('.creative-widget');
    if (!widget) return;
    widget.dataset.creativeTheme = colorButton.dataset.elevenColor;
    widget.querySelectorAll('[data-eleven-color]').forEach(button => {
      button.setAttribute('aria-pressed', button === colorButton ? 'true' : 'false');
    });
    elevenSetStatus('A lovely color for your story! 🎨', 'success');
  }
});

window.addEventListener('pagehide', () => {
  if (elevenRecorder?.state === 'recording') {
    elevenDiscardRecording = true;
    elevenRecorder.stop();
  }
  elevenStream?.getTracks().forEach(track => track.stop());
  if (elevenAudioUrl) URL.revokeObjectURL(elevenAudioUrl);
});
