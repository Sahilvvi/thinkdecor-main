import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Thin wrapper around the browser's native SpeechRecognition — no server
 * round-trip, no added latency or API cost, works fully offline of Gemini.
 * Chrome/Edge only (Firefox has none, Safari is partial); callers check
 * `supported` and hide/disable their mic button rather than erroring.
 */

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceInput({ onResult, onError }: {
  onResult: (transcript: string) => void;
  onError?: (message: string) => void;
}) {
  const Ctor = useRef(getSpeechRecognitionCtor());
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = useState(false);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  onResultRef.current = onResult;
  onErrorRef.current = onError;

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const start = useCallback(() => {
    if (!Ctor.current || listening) return;
    const recognition = new Ctor.current();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
      }
      if (finalText.trim()) onResultRef.current(finalText.trim());
    };
    recognition.onerror = (event) => {
      const message =
        event.error === 'not-allowed' || event.error === 'permission-denied'
          ? 'Microphone access was denied.'
          : event.error === 'no-speech'
            ? "Didn't catch that — try again."
            : 'Voice input failed.';
      onErrorRef.current?.(message);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported: !!Ctor.current, listening, start, stop };
}
