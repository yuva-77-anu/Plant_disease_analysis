import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Languages } from 'lucide-react';

const VOICE_ASSISTANT_KEY = 'plantguard_voice_language';

export default function VoiceAssistant({ text, onClose, autoSpeak = false }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem(VOICE_ASSISTANT_KEY) || 'en-US');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  const languages = [
    { code: 'en-US', label: 'English', flag: '🇬🇧' },
    { code: 'ta-IN', label: 'Tamil', flag: '🇮🇳' },
  ];

  useEffect(() => {
    if (autoSpeak && text) {
      speak(text);
    }
  }, [text, autoSpeak, language]);

  useEffect(() => {
    localStorage.setItem(VOICE_ASSISTANT_KEY, language);
  }, [language]);

  const speak = (textToSpeak) => {
    if (!textToSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find((v) => v.lang === language);
    if (langVoice) utterance.voice = langVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {transcript && (
        <div className="max-w-xs rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <p className="text-sm text-gray-700">You said: "{transcript}"</p>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 shadow-lg">
        <div className="flex items-center gap-1 px-2">
          <Languages size={16} className="text-gray-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-gray-200" />

        <button
          onClick={isListening ? stopListening : startListening}
          className={`rounded-full p-2 transition-colors ${
            isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          onClick={isSpeaking ? stopSpeaking : () => text && speak(text)}
          disabled={!text}
          className={`rounded-full p-2 transition-colors ${
            isSpeaking ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          }`}
          title={isSpeaking ? 'Stop speaking' : 'Listen to recommendations'}
        >
          {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {isListening && (
        <div className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-white shadow-lg">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
          Listening...
        </div>
      )}
    </div>
  );
}
