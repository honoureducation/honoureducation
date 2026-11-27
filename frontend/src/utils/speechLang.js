/**
 * Which English accent the browser's speech recognition should expect.
 * Recognition is far more accurate when this matches how the pupils speak.
 * Saved per device so the teacher only chooses once.
 */
export const SPEECH_ACCENTS = [
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-IN', label: 'English (India / South Asia)' },
  { value: 'en-AU', label: 'English (Australia)' },
  { value: 'en-IE', label: 'English (Ireland)' },
  { value: 'en-ZA', label: 'English (South Africa)' },
  { value: 'en-NG', label: 'English (Nigeria)' },
  { value: 'en-PH', label: 'English (Philippines)' },
];

const KEY = 'speechLang';
const DEFAULT_LANG = 'en-GB';
export const SPEECH_LANG_EVENT = 'speech-lang-change';

export function getSpeechLang() {
  try {
    const v = localStorage.getItem(KEY);
    return SPEECH_ACCENTS.some((a) => a.value === v) ? v : DEFAULT_LANG;
  } catch (e) {
    return DEFAULT_LANG;
  }
}

export function setSpeechLang(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch (e) {
    // storage unavailable — the choice just won't be remembered
  }
  window.dispatchEvent(new CustomEvent(SPEECH_LANG_EVENT, { detail: value }));
}
