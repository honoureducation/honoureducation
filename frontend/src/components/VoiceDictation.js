import React, { useState, useEffect, useRef } from 'react';

/**
 * Enhanced Voice Dictation Component
 * Features:
 * - maxAlternatives = 3 (captures accented / soft variations)
 * - Auto-restart keep-alive on speech pauses (prevents abrupt browser silence cut-offs)
 * - Error resilience ('no-speech' does not kill the session)
 * - Visual live audio wave indicator
 */
export default function VoiceDictation({ onInterimResult, onStart }) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);
    const accumulatedTextRef = useRef('');
    const restartTimeoutRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let newFinalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const res = event.results[i];
                if (res.isFinal) {
                    newFinalTranscript += res[0].transcript + ' ';
                } else {
                    interimTranscript += res[0].transcript;
                }
            }

            accumulatedTextRef.current += newFinalTranscript;

            const currentSessionText = (accumulatedTextRef.current + interimTranscript).trim();
            if (currentSessionText && onInterimResult) {
                onInterimResult(currentSessionText);
            }
        };

        recognition.onerror = (event) => {
            // 'no-speech' is common when a student pauses to think — don't cancel session
            if (event.error === 'no-speech') {
                return;
            }
            if (event.error === 'aborted') {
                return;
            }
            console.warn('Speech recognition warning:', event.error);
            if (event.error === 'not-allowed' || event.error === 'audio-capture') {
                setIsListening(false);
                isListeningRef.current = false;
            }
        };

        recognition.onend = () => {
            // Keep-alive: If teacher/student hasn't clicked stop, automatically restart to avoid timeout cut-offs
            if (isListeningRef.current) {
                clearTimeout(restartTimeoutRef.current);
                restartTimeoutRef.current = setTimeout(() => {
                    if (isListeningRef.current && recognitionRef.current) {
                        try {
                            recognitionRef.current.start();
                        } catch (err) {
                            // If already started or starting, ignore
                        }
                    }
                }, 150);
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            isListeningRef.current = false;
            clearTimeout(restartTimeoutRef.current);
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // ignore
                }
            }
        };
    }, [onInterimResult]);

    const toggleListen = () => {
        if (isListeningRef.current) {
            isListeningRef.current = false;
            clearTimeout(restartTimeoutRef.current);
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // ignore
                }
            }
            setIsListening(false);
        } else {
            if (recognitionRef.current) {
                accumulatedTextRef.current = ''; // Reset for a fresh student answer
                if (onStart) onStart();
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                    isListeningRef.current = true;
                } catch (e) {
                    console.error('Error starting speech recognition:', e);
                }
            }
        }
    };

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={toggleListen}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm select-none ${
                isListening
                    ? 'bg-rose-50 text-rose-600 border border-rose-300 ring-2 ring-rose-200'
                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow'
            }`}
            title={isListening ? "Click when the student has finished speaking" : "Click to record student's spoken response"}
        >
            {isListening ? (
                <>
                    <span className="flex items-center gap-1 h-3.5">
                        <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-2.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce"></span>
                        <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                    </span>
                    <span>Listening... (Click to Finish)</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Answer with Voice</span>
                </>
            )}
        </button>
    );
}
