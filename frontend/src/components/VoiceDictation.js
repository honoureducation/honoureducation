import React, { useState, useEffect, useRef } from 'react';
import { getSpeechLang } from '../utils/speechLang';
import { normaliseWord } from '../utils/readingMistakes';

/**
 * Enhanced Voice Dictation Component
 * Features:
 * - maxAlternatives = 3 (captures accented / soft variations)
 * - Auto-restart keep-alive on speech pauses (prevents abrupt browser silence cut-offs)
 * - Auto-finishes after 5 seconds without speech (SILENCE_TIMEOUT_MS)
 * - Optional ↻ clear button (onClear) so the pupil can answer again from scratch
 * - Error resilience ('no-speech' does not kill the session)
 * - Visual live audio wave indicator
 */

// How long the student can stay silent before the mic stops listening —
// both before they start answering and after they finish.
const SILENCE_TIMEOUT_MS = 5000;

// Browsers allow only one speech-recognition session at a time. When several
// dictation buttons are on a page (e.g. one per question), starting one stops the others.
const STOP_OTHERS_EVENT = 'voice-dictation-start';
let activeDictationId = null;
let nextDictationId = 1;

// Quiet-voice support: the mic is opened with the browser's automatic gain control
// and noise suppression, then amplified (with a limiter so loud pupils don't distort).
// Browsers that accept an audio track in recognition.start(track) hear the boosted
// signal directly; others ignore the extra argument, but still benefit from the
// browser's auto-gain raising the microphone input level while the mic is open.
const MIC_BOOST_GAIN = 3;

async function openBoostedMic() {
    if (!navigator.mediaDevices?.getUserMedia) return null;
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            autoGainControl: true,
            noiseSuppression: true,
            echoCancellation: true,
            channelCount: 1,
        },
    });
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return { stream, ctx: null, track: stream.getAudioTracks()[0] || null };
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(stream);
    const gain = ctx.createGain();
    gain.gain.value = MIC_BOOST_GAIN;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;
    const dest = ctx.createMediaStreamDestination();
    source.connect(gain).connect(limiter).connect(dest);
    // Level meter on the raw microphone input, so the teacher can see if the pupil is too quiet
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch (e) { /* ignore */ }
    }
    return { stream, ctx, analyser, track: dest.stream.getAudioTracks()[0] || null };
}

// 0–1 loudness of the raw mic input right now
function micLevel(analyser, buf) {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    return Math.min(1, rms * 8);
}

// Below this the speech is usually too quiet for recognition to catch every word
const QUIET_LEVEL = 0.06;
// Warn once the pupil has been speaking this quietly for a while
const QUIET_WARN_MS = 2500;

/**
 * Pick the browser guess that best fits the text the pupil is reading.
 * Each result comes with up to 3 guesses; for passages the first guess is often
 * a near-miss ("pat the big dock") while another guess is the real reading.
 */
function pickAlternative(res, wantWords) {
    if (!wantWords || res.length < 2) return res[0].transcript;
    let best = res[0].transcript;
    let bestScore = -1;
    for (let a = 0; a < res.length; a++) {
        const words = String(res[a].transcript).split(/\s+/).map(normaliseWord).filter(Boolean);
        if (!words.length) continue;
        const hits = words.filter((w) => wantWords.has(w)).length;
        // prefer more matching words; on a tie keep the browser's own ranking
        const score = hits / words.length;
        if (score > bestScore + 1e-9) {
            bestScore = score;
            best = res[a].transcript;
        }
    }
    return best;
}

function closeBoostedMic(mic) {
    if (!mic) return;
    try { mic.stream.getTracks().forEach((t) => t.stop()); } catch (e) { /* ignore */ }
    try { if (mic.track) mic.track.stop(); } catch (e) { /* ignore */ }
    try { if (mic.ctx) mic.ctx.close(); } catch (e) { /* ignore */ }
}

// Start recognition on the boosted track where supported, falling back to the default mic
function startRecognition(recognition, track) {
    if (track) {
        try {
            recognition.start(track);
            return;
        } catch (e) {
            if (e && e.name === 'InvalidStateError') throw e; // already running
        }
    }
    recognition.start();
}

const TONES = {
    success: 'bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700',
    warning: 'bg-amber-500 text-white border border-amber-500 hover:bg-amber-600',
    error: 'bg-rose-600 text-white border border-rose-600 hover:bg-rose-700',
};

export default function VoiceDictation({
    onInterimResult,
    onStart,
    idleLabel = 'Answer with Voice',
    activeLabel = 'Listening... (Click to Finish)',
    // Optional: (text) => boolean. When it returns true the mic stops by itself
    // shortly after (e.g. once the pupil has said the target word).
    stopWhen,
    className = '',
    // Optional: show a ↻ button that clears the captured answer so the pupil can
    // answer again (the new answer starts fresh instead of adding to the old one)
    onClear,
    hasAnswer = false,
    // Optional: the word the pupil should say. If any of the browser's guesses
    // contains it, that guess is used (short words like "bug" are often
    // first heard as "bag" / "but").
    preferText,
    // Optional: colour the idle button with the result — 'success' | 'warning' | 'error'
    tone,
    // How long the pupil can stay silent before the mic stops (reading passages
    // need longer — pupils pause to sound out words)
    silenceMs = SILENCE_TIMEOUT_MS,
    // Show a live volume meter and a "too quiet" warning while listening
    showLevel = true,
}) {
    const [isListening, setIsListening] = useState(false);
    const [level, setLevel] = useState(0);
    const [tooQuiet, setTooQuiet] = useState(false);
    const silenceMsRef = useRef(silenceMs);
    silenceMsRef.current = silenceMs;
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);
    const accumulatedTextRef = useRef('');
    const interimTextRef = useRef('');
    const restartTimeoutRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const idRef = useRef(null);
    const micRef = useRef(null);
    if (idRef.current === null) idRef.current = nextDictationId++;

    // Keep the latest callbacks in refs so parent re-renders (which create new function
    // identities on every result) never tear down the recognition session.
    const onInterimResultRef = useRef(onInterimResult);
    const onStartRef = useRef(onStart);
    const stopWhenRef = useRef(stopWhen);
    const preferTextRef = useRef(preferText);
    preferTextRef.current = preferText;
    const autoStopRef = useRef(null);
    useEffect(() => {
        onInterimResultRef.current = onInterimResult;
        onStartRef.current = onStart;
        stopWhenRef.current = stopWhen;
    }, [onInterimResult, onStart, stopWhen]);

    const stopListening = () => {
        if (activeDictationId === idRef.current) activeDictationId = null;
        isListeningRef.current = false;
        clearTimeout(restartTimeoutRef.current);
        clearTimeout(silenceTimeoutRef.current);
        clearTimeout(autoStopRef.current);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // ignore
            }
        }
        closeBoostedMic(micRef.current);
        micRef.current = null;
        setIsListening(false);
    };

    const resetSilenceTimer = () => {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
            if (isListeningRef.current) stopListening();
        }, silenceMsRef.current);
    };

    // Live volume meter while listening
    useEffect(() => {
        if (!isListening || !showLevel) {
            setLevel(0);
            setTooQuiet(false);
            return undefined;
        }
        let quietSince = null;
        let heardVoice = false;
        let buf = null;
        const timer = setInterval(() => {
            const analyser = micRef.current?.analyser;
            if (!analyser) return;
            if (!buf) buf = new Float32Array(analyser.fftSize);
            const l = micLevel(analyser, buf);
            setLevel(l);
            // Only judge "too quiet" once there's some sound — not while the pupil hasn't started
            if (l > 0.015) heardVoice = true;
            if (heardVoice && l < QUIET_LEVEL) {
                if (quietSince === null) quietSince = Date.now();
                if (Date.now() - quietSince > QUIET_WARN_MS) setTooQuiet(true);
            } else if (l >= QUIET_LEVEL * 1.5) {
                quietSince = null;
                setTooQuiet(false);
            }
        }, 120);
        return () => clearInterval(timer);
    }, [isListening, showLevel]);

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
        recognition.maxAlternatives = 5;
        recognition.lang = getSpeechLang();

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let newFinalTranscript = '';

            const want = String(preferTextRef.current || '').trim().toLowerCase();
            const wantWordList = want.split(/[\s—–]+/).map(normaliseWord).filter(Boolean);
            // Single target word (FS1/FS2 cards): use any guess that contains it.
            // Whole passage: use the guess that best fits the passage.
            const wantRe = wantWordList.length === 1
                ? new RegExp(`\\b${want.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
                : null;
            const wantWords = wantWordList.length > 1 ? new Set(wantWordList) : null;
            const pick = (res) => {
                if (wantRe) {
                    for (let a = 0; a < res.length; a++) {
                        if (wantRe.test(res[a].transcript)) return res[a].transcript;
                    }
                    return res[0].transcript;
                }
                return pickAlternative(res, wantWords);
            };

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const res = event.results[i];
                if (res.isFinal) {
                    newFinalTranscript += pick(res) + ' ';
                } else {
                    interimTranscript += pick(res);
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
            if (currentSessionText && stopWhenRef.current && stopWhenRef.current(currentSessionText)) {
                clearTimeout(autoStopRef.current);
                autoStopRef.current = setTimeout(() => {
                    if (isListeningRef.current) stopListeningRef.current();
                }, 1200);
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
                            startRecognition(recognitionRef.current, micRef.current?.track);
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
            closeBoostedMic(micRef.current);
            micRef.current = null;
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

            const begin = async () => {
                if (!isListeningRef.current || !recognitionRef.current) return;
                if (!micRef.current) {
                    try {
                        micRef.current = await openBoostedMic();
                    } catch (e) {
                        micRef.current = null; // fall back to the default mic
                    }
                    // Pupil may have clicked stop while the mic was opening
                    if (!isListeningRef.current) {
                        closeBoostedMic(micRef.current);
                        micRef.current = null;
                        return;
                    }
                }
                try {
                    // Use the accent the teacher picked (may have changed since the page loaded)
                    recognitionRef.current.lang = getSpeechLang();
                    startRecognition(recognitionRef.current, micRef.current?.track);
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

    const clearAnswer = () => {
        if (isListeningRef.current) stopListening();
        accumulatedTextRef.current = '';
        interimTextRef.current = '';
        if (onClear) onClear();
    };

    const meterBars = 5;
    const litBars = Math.round(level * meterBars * 1.4);

    return (
        <span className="inline-flex flex-wrap items-center justify-center gap-1.5">
        {isListening && showLevel && micRef.current?.analyser && (
            <span
                className="order-last basis-full flex flex-col items-center gap-0.5"
                aria-live="polite"
            >
                <span className="flex items-end gap-0.5 h-3" title="Microphone volume">
                    {Array.from({ length: meterBars }, (_, i) => (
                        <span
                            key={i}
                            className={`w-1.5 rounded-sm transition-colors ${
                                i < litBars
                                    ? tooQuiet ? 'bg-amber-500' : 'bg-emerald-500'
                                    : 'bg-slate-200'
                            }`}
                            style={{ height: `${40 + i * 15}%` }}
                        />
                    ))}
                </span>
                {tooQuiet && (
                    <span className="text-[11px] font-bold text-amber-700 text-center leading-tight">
                        Too quiet — ask the pupil to speak up or move the laptop closer
                    </span>
                )}
            </span>
        )}
        <button
            type="button"
            onClick={toggleListen}
            className={`${className} flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm select-none ${
                isListening
                    ? 'bg-rose-50 text-rose-600 border border-rose-300 ring-2 ring-rose-200'
                    : TONES[tone] || 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow'
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
                    <svg className={`w-4 h-4 shrink-0 ${TONES[tone] ? 'text-current' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>{idleLabel}</span>
                </>
            )}
        </button>
        {onClear && hasAnswer && !isListening && (
            <button
                type="button"
                onClick={clearAnswer}
                title="Clear this answer so the pupil can answer again"
                aria-label="Clear answer and answer again"
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </button>
        )}
        </span>
    );
}
