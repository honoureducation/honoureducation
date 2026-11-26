/**
 * Voice Utilities for AI Assessment Conductor
 * Supports 2 distinct American Accent Voices:
 * 1. American Accent (Female) - 🇺🇸
 * 2. American Accent (Male)   - 🇺🇸
 */

export const VOICE_OPTIONS = [
  {
    id: "american-female",
    gender: "female",
    label: "Female Voice",
    shortLabel: "Female",
    flag: "",
    avatar: "👩‍🏫",
    desc: "Natural, articulate female educator voice",
    sampleText:
      "Hello! I am your AI Assessment Conductor. I will read the questions aloud in a female voice.",
  },
  {
    id: "american-male",
    gender: "male",
    label: "Male Voice",
    shortLabel: "Male",
    flag: "",
    avatar: "👨‍🏫",
    desc: "Clear, authoritative male educator voice",
    sampleText:
      "Hello! I am your AI Assessment Conductor. I will read the questions aloud in a male voice.",
  },
];

const FEMALE_KEYWORDS = [
  "female",
  "zira",
  "aria",
  "jenny",
  "samantha",
  "victoria",
  "ava",
  "allison",
  "susan",
  "clara",
  "ivy",
  "salli",
  "joanna",
  "kendra",
  "kimberly",
  "michelle",
  "ana",
  "catherine",
  "sarah",
  "lisa",
  "emma",
];

const MALE_KEYWORDS = [
  "male",
  "david",
  "guy",
  "christopher",
  "eric",
  "mark",
  "james",
  "richard",
  "paul",
  "alex",
  "fred",
  "tom",
  "aaron",
  "matt",
  "brian",
  "michael",
  "george",
  "andrew",
  "stephen",
  "daniel",
];

export function getPreferredVoiceId() {
  if (typeof window === "undefined") return "american-female";
  const saved = localStorage.getItem("preferredVoiceId");
  if (saved && (saved === "american-female" || saved === "american-male")) {
    return saved;
  }
  const savedGender = localStorage.getItem("preferredVoiceGender");
  if (savedGender === "male") return "american-male";
  return "american-female";
}

export function setPreferredVoiceId(voiceId) {
  if (typeof window === "undefined") return;
  const validId = voiceId === "american-male" ? "american-male" : "american-female";
  localStorage.setItem("preferredVoiceId", validId);
  localStorage.setItem("preferredVoiceGender", validId === "american-male" ? "male" : "female");
  window.dispatchEvent(
    new CustomEvent("app-voice-changed", { detail: { voiceId: validId } })
  );
}

/**
 * Discovers and selects the optimal American Voice from the browser's speechSynthesis list.
 */
export function pickAmericanVoice(allVoices = [], voiceId = "american-female") {
  if (!allVoices || allVoices.length === 0) {
    return {
      voice: null,
      gender: voiceId === "american-male" ? "male" : "female",
      pitch: voiceId === "american-male" ? 0.92 : 1.05,
      rate: 0.95,
    };
  }

  const isMale = voiceId === "american-male";
  const targetKeywords = isMale ? MALE_KEYWORDS : FEMALE_KEYWORDS;
  const oppositeKeywords = isMale ? FEMALE_KEYWORDS : MALE_KEYWORDS;

  // 1. Strict en-US voices
  const usVoices = allVoices.filter((v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    return lang === "en-us" || lang.startsWith("en-us");
  });

  // 2. All English voices as fallback pool
  const enVoices = allVoices.filter((v) => {
    const lang = (v.lang || "").toLowerCase();
    return lang.startsWith("en");
  });

  const primaryPool = usVoices.length > 0 ? usVoices : enVoices.length > 0 ? enVoices : allVoices;

  // Strategy A: Natural / Online / Neural en-US voice matching target gender
  const naturalMatch = primaryPool.find((v) => {
    const name = (v.name || "").toLowerCase();
    const matchesTarget = targetKeywords.some((kw) => name.includes(kw));
    const isNatural =
      name.includes("natural") ||
      name.includes("online") ||
      name.includes("neural");
    return matchesTarget && isNatural;
  });
  if (naturalMatch) {
    return {
      voice: naturalMatch,
      gender: isMale ? "male" : "female",
      pitch: isMale ? 0.92 : 1.05,
      rate: 0.95,
    };
  }

  // Strategy B: Any en-US voice matching target keywords
  const keywordMatch = primaryPool.find((v) => {
    const name = (v.name || "").toLowerCase();
    return targetKeywords.some((kw) => name.includes(kw));
  });
  if (keywordMatch) {
    return {
      voice: keywordMatch,
      gender: isMale ? "male" : "female",
      pitch: isMale ? 0.92 : 1.05,
      rate: 0.95,
    };
  }

  // Strategy C: Google US English special handling
  if (!isMale) {
    const googleUsFemale = primaryPool.find((v) => {
      const name = (v.name || "").toLowerCase();
      return name.includes("google") && (name.includes("us") || name.includes("english")) && !name.includes("male");
    });
    if (googleUsFemale) {
      return {
        voice: googleUsFemale,
        gender: "female",
        pitch: 1.05,
        rate: 0.95,
      };
    }
  } else {
    const googleUsMale = primaryPool.find((v) => {
      const name = (v.name || "").toLowerCase();
      return name.includes("google") && name.includes("male");
    });
    if (googleUsMale) {
      return {
        voice: googleUsMale,
        gender: "male",
        pitch: 0.92,
        rate: 0.95,
      };
    }
  }

  // Strategy D: Voice from US pool that does NOT match opposite keywords
  const candidate = primaryPool.find((v) => {
    const name = (v.name || "").toLowerCase();
    return !oppositeKeywords.some((kw) => name.includes(kw));
  });

  const selectedVoice = candidate || primaryPool[0] || allVoices[0];

  return {
    voice: selectedVoice,
    gender: isMale ? "male" : "female",
    pitch: isMale ? 0.88 : 1.08, // Adjust pitch slightly to distinguish if generic voice
    rate: 0.95,
  };
}

/**
 * Speaks an audio preview of the selected American voice
 */
export function playVoicePreview(voiceId, onStart, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const option =
    VOICE_OPTIONS.find((v) => v.id === voiceId) || VOICE_OPTIONS[0];
  const allVoices = synth.getVoices() || [];
  const { voice, pitch, rate } = pickAmericanVoice(allVoices, voiceId);

  const utterance = new SpeechSynthesisUtterance(option.sampleText);
  if (voice) {
    utterance.voice = voice;
  }
  utterance.pitch = pitch;
  utterance.rate = rate;

  if (onStart) utterance.onstart = onStart;
  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  synth.speak(utterance);
}

export function stopVoice() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

