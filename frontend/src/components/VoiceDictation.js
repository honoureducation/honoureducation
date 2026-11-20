import React, { useState, useEffect, useRef } from 'react';

/**
 * Enhanced Voice Dictation Component
 * Features:
 * - maxAlternatives = 3 (captures accented / soft variations)
 * - Auto-restart keep-alive on speech pauses (prevents abrupt browser silence cut-offs)
 * - Only auto-finishes after a long silence (SILENCE_TIMEOUT_MS)
 * - Error resilience ('no-speech' does not kill the session)
 * - Visual live audio wave indicator
 */

// How long the student can stay silent before the mic auto-finishes.
// Short browser pauses are bridged automatically; only a genuinely long pause ends the answer.
const SILENCE_TIMEOUT_MS = 10000;

// Browsers allow only one speech-recognition session at a time. When several
// dictation buttons are on a page (e.g. one per question), starting one stops the others.
const STOP_OTHERS_EVENT = 'voice-dictation-start';
let activeDictationId = null;
let nextDictationId = 1;

export default function VoiceDictation({
    onInterimResult,
    onStart,
    idleLabel = 'Answer with Voice',
    activeLabel = 'Listening... (Click to Finish)',
}) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);
    const accumulatedTextRef = useRef('');
    const interimTextRef = useRef('');
    const restartTimeoutRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const idRef = useRef(null);
    if (idRef.current === null) idRef.current = nextDictationId++;

    // Keep the latest callbacks in refs so parent re-renders (which create new function
    // identities on every result) never tear down the recognition session.
    const onInterimResultRef = useRef(onInterimResult);
    const onStartRef = useRef(onStart);
    useEffect(() => {
        onInterimResultRef.current = onInterimResult;
        onStartRef.current = onStart;
    }, [onInterimResult, onStart]);

    const stopListening = () => {
        if (activeDictationId === idRef.current) activeDictationId = null;
        isListeningRef.current = false;
        clearTimeout(restartTimeoutRef.current);
        clearTimeout(silenceTimeoutRef.current);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // ignore
            }
        }
        setIsListening(false);
    };

    const resetSilenceTimer = () => {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
            if (isListeningRef.current) stopListening();
        }, SILENCE_TIMEOUT_MS);
    };

    // Refs so the once-created recognition handlers always call the latest versions
    const stopListeningRef = useRef(stopListening);
    stopListeningRef.current = stopListening;
    const resetSilenceTimerRef = useRef(resetSilenceTimer);
    resetSilenceTimerRef.current = resetSilenceTimer;

    // Stop this mic when another dictation button starts
    useEffect(() => {
        const handler = (e) => {
            if (e.detail !== idRef.current && isListeningRef.current) stopListeningRef.current();
        };
        window.addEventListener(STOP_OTHERS_EVENT, handler);
        return () => window.removeEventListener(STOP_OTHERS_EVENT, handler);
    }, []);

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
            interimTextRef.current = interimTranscript;

            // Student is speaking — push back the auto-finish timer
            resetSilenceTimerRef.current();

            const currentSessionText = (accumulatedTextRef.current + interimTranscript).trim();
            if (currentSessionText && onInterimResultRef.current) {
                onInterimResultRef.current(currentSessionText);
            }
        };

        recognition.onerror = (event) => {
            // 'no-speech' is common when a student pauses to think — don't cancel session
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return;
            }
            console.warn('Speech recognition warning:', event.error);
            if (event.error === 'not-allowed' || event.error === 'audio-capture') {
                stopListeningRef.current();
            }
        };

        recognition.onend = () => {
            // The browser ends the session on short pauses. Keep any unfinalized
            // words so they aren't lost across the restart.
            if (interimTextRef.current) {
                accumulatedTextRef.current += interimTextRef.current + ' ';
                interimTextRef.current = '';
            }
            // Keep-alive: restart until the user clicks finish or the long-silence timer fires
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
            clearTimeout(silenceTimeoutRef.current);
            try {
                recognition.stop();
            } catch (e) {
                // ignore
            }
        };
    }, []);

    const toggleListen = () => {
        if (isListeningRef.current) {
            stopListening();
        } else if (recognitionRef.current) {
            accumulatedTextRef.current = ''; // Reset for a fresh student answer
            interimTextRef.current = '';
            if (onStartRef.current) onStartRef.current();

            // Stop any other dictation button that is currently listening
            const anotherActive = activeDictationId !== null && activeDictationId !== idRef.current;
            window.dispatchEvent(new CustomEvent(STOP_OTHERS_EVENT, { detail: idRef.current }));
            activeDictationId = idRef.current;
            setIsListening(true);
            isListeningRef.current = true;

            const begin = () => {
                if (!isListeningRef.current || !recognitionRef.current) return;
                try {
                    recognitionRef.current.start();
                    resetSilenceTimerRef.current();
                } catch (e) {
                    console.error('Error starting speech recognition:', e);
                    stopListeningRef.current();
                }
            };
            // Give the browser a moment to release the other mic session
            if (anotherActive) setTimeout(begin, 300);
            else begin();
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
                    <span>{activeLabel}</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>{idleLabel}</span>
                </>
            )}
        </button>
    );
}
