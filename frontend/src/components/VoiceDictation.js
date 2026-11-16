import React, { useState, useEffect, useRef } from 'react';

export default function VoiceDictation({ onInterimResult, onStart }) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);
    const accumulatedTextRef = useRef('');

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let newFinalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    newFinalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            accumulatedTextRef.current += newFinalTranscript;

            const currentSessionText = (accumulatedTextRef.current + interimTranscript).trim();
            if (currentSessionText && onInterimResult) {
                onInterimResult(currentSessionText);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            isListeningRef.current = false;
        };

        recognition.onend = () => {
            // If we are still supposed to be listening (e.g. continuous dictation timed out but we want to stick),
            // we could restart. But standard behavior is just to stop.
            setIsListening(false);
            isListeningRef.current = false;
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onInterimResult]);

    const toggleListen = () => {
        if (isListeningRef.current) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            isListeningRef.current = false;
        } else {
            if (recognitionRef.current) {
                accumulatedTextRef.current = ''; // Reset for a new listening session
                if (onStart) onStart();
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                    isListeningRef.current = true;
                } catch (e) {
                    console.error(e);
                }
            }
        }
    };

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        // If not supported, just don't render the button
        return null;
    }

    return (
        <button
            type="button"
            onClick={toggleListen}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${isListening
                ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:shadow'
                }`}
        >
            {isListening ? (
                <>
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Listening... (Click to stop)
                </>
            ) : (
                <>
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Answer with Voice
                </>
            )}
        </button>
    );
}
