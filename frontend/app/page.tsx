"use client";

import Link from 'next/link';
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { apiUrl } from "../lib/api";

function LegacyHome() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>yourOwn</h1>
        <p style={styles.subtitle}>Silent disorientation support for safer daily routines</p>
      </header>

      <main style={styles.main}>
        <div style={styles.heroSection}>
          <h2 style={styles.heroTitle}>
            Privacy-First AI Support Powered by Gemma 4
          </h2>
          <p style={styles.heroText}>
            Detects silent disorientation, restores reality, and escalates safely when the patient cannot respond
          </p>
        </div>

        <div style={styles.cardsContainer}>
          <Link href="/patient/dashboard" style={{ textDecoration: 'none' }}>
            <div style={styles.card}>
              <div style={{ ...styles.cardIcon, backgroundColor: '#4ECDC4' }}>
                👤
              </div>
              <h3 style={styles.cardTitle}>Patient Companion</h3>
              <p style={styles.cardDescription}>
                Speak with your AI companion. Get personalized responses. Stay safe.
              </p>
              <p style={styles.cardLink}>Open Dashboard →</p>
            </div>
          </Link>

          <Link href="/doctor/dashboard" style={{ textDecoration: 'none' }}>
            <div style={styles.card}>
              <div style={{ ...styles.cardIcon, backgroundColor: '#2196F3' }}>
                🏥
              </div>
              <h3 style={styles.cardTitle}>Doctor Dashboard</h3>
              <p style={styles.cardDescription}>
                Live alerts, care reasoning timeline, MMSE score, medications, and clinical notes.
              </p>
              <p style={styles.cardLink}>Open Dashboard →</p>
            </div>
          </Link>
        </div>

        <section style={styles.featuresSection}>
          <h2 style={styles.sectionTitle}>Key Features</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.featureBox}>
              <span style={styles.featureIcon}>🎤</span>
              <h4 style={styles.featureTitle}>Voice Recognition</h4>
              <p style={styles.featureText}>
                Recognizes family members & responds with personalized care
              </p>
            </div>

            <div style={styles.featureBox}>
              <span style={styles.featureIcon}>📍</span>
              <h4 style={styles.featureTitle}>Safety Monitoring</h4>
              <p style={styles.featureText}>
                GPS safe-place matching with automatic caregiver alert if patient leaves known locations
              </p>
            </div>

            <div style={styles.featureBox}>
              <span style={styles.featureIcon}>💊</span>
              <h4 style={styles.featureTitle}>Medication Tracking</h4>
              <p style={styles.featureText}>
                Spoken medication reminders at the right time using doctor notes and daily schedule
              </p>
            </div>

            <div style={styles.featureBox}>
              <span style={styles.featureIcon}>🧠</span>
              <h4 style={styles.featureTitle}>Gemma 4 Medical AI</h4>
              <p style={styles.featureText}>
                Local AI with medical knowledge. Privacy first.
              </p>
            </div>

            <div style={styles.featureBox}>
              <span style={styles.featureIcon}>📊</span>
              <h4 style={styles.featureTitle}>Progression Tracking</h4>
              <p style={styles.featureText}>
                Doctors see cognitive scores & AI insights
              </p>
            </div>

            <div style={styles.featureBox}>
              <span style={styles.featureIcon}>🔒</span>
              <h4 style={styles.featureTitle}>Privacy First</h4>
              <p style={styles.featureText}>
                Powered by Gemma 4. Voice, vision, and care reasoning — with full local Ollama mode for complete privacy.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>yourOwn • Powered by Gemma 4 • Gemma 4 Good Hackathon 2026</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    background: 'linear-gradient(135deg, #4ECDC4 0%, #2196F3 100%)',
    color: 'white',
    padding: '60px 20px',
    textAlign: 'center' as const,
  },
  title: {
    margin: '0',
    fontSize: '48px',
    fontWeight: 'bold'
  },
  subtitle: {
    margin: '10px 0 0 0',
    fontSize: '18px',
    opacity: 0.95
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  heroSection: {
    textAlign: 'center' as const,
    marginBottom: '60px'
  },
  heroTitle: {
    margin: '0 0 15px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333'
  },
  heroText: {
    margin: '0',
    fontSize: '16px',
    color: '#666'
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    marginBottom: '60px'
  },
  card: {
    padding: '30px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  cardIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: '32px',
    marginBottom: '15px'
  },
  cardTitle: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333'
  },
  cardDescription: {
    margin: '0 0 15px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6'
  },
  cardLink: {
    margin: '0',
    color: '#4ECDC4',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  featuresSection: {
    marginBottom: '60px'
  },
  sectionTitle: {
    margin: '0 0 40px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    color: '#333'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px'
  },
  featureBox: {
    padding: '25px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    textAlign: 'center' as const,
  },
  featureIcon: {
    fontSize: '40px',
    display: 'block',
    marginBottom: '15px'
  },
  featureTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  featureText: {
    margin: '0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6'
  },
  footer: {
    backgroundColor: '#333',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center' as const,
    fontSize: '14px'
  }
};

type ThemeName = "light" | "dark";
type ViewMode = "laptop" | "mobile";
type RoleName = "patient" | "family" | "doctor";

type PersonRecord = {
  id: string;
  name: string;
  relationship: string;
  notes: string;
  photo_url: string | null;
};

type MedicineEntry = {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  appearance: string;
};
type CameraButtonName = "start" | "capture" | "stop";
type GpsButtonName = "get" | "live";
type MobilePatientButtonName = "scared" | "where" | "medicine" | "speak" | "send";
type CareScheduleItem = {
  time: string;
  label: string;
  careMoment: boolean;
  alarm: boolean;
  kind: "breakfast" | "lunch" | "dinner" | "medication" | "routine";
};

type SeverityTrend = {
  trend: "collecting_baseline" | "improving" | "stable" | "worsening" | string;
  recentAverage: number;
  previousAverage: number;
  delta: number;
  samples: number;
  highRiskRecent: number;
  silentConfusionRecent?: number;
  silentConfusionPrevious?: number;
  spokenOrientationRecent?: number;
  doctorSummary?: string;
  clinicalCaution?: string;
  topRiskDrivers?: {
    flag: string;
    count: number;
  }[];
  recent: {
    timestamp: string;
    transcript: string;
    episodeType?: string;
    silentConfusion?: boolean;
    riskLevel: string;
    score: number;
    flags: string[];
    behaviorScore?: number;
  }[];
};

type PhotoMemory = {
  id: string;
  imageDataUrl: string;
  name: string;
  relationship: string;
  description: string;
};

type PatientNote = {
  id: string;
  timestamp: string;
  text: string;
};

type AssistResponse = {
  response_type?: "conversation" | "care" | string;
  companion_message?: string;
  mode: string;
  confidence: number;
  detected_language: string;
  interpreted_language: string;
  transcript?: string;
  transcript_language_code?: string | null;
  environment: {
    likely_place: string;
    likely_people: string[];
    time_context: string;
    routine_hint: string;
    gps_match?: {
      name: string;
      meaning: string;
      distance_meters: number;
    } | null;
  };
  response: {
    reassurance: string;
    context: string;
    next_step: string;
  };
  care_reasoning?: {
    risk: {
      level: "low" | "medium" | "high" | "emergency" | string;
      score: number;
      flags: string[];
      reasons: string[];
    };
    evidence: string[];
    action_plan: {
      patient_action: string;
      caregiver_action: string;
      doctor_action: string;
      alert_family: boolean;
      alert_doctor: boolean;
      safe_place_status: string;
    };
    tool_trace: {
      tool: string;
      result: unknown;
    }[];
    verification: {
      safe_to_send: boolean;
      unsupported_claims: string[];
      grounding_score: number;
      checked_against: string[];
    };
  };
  memory_summary: string[];
  score_reasons: string[];
  stored_event: {
    speaker_role: string;
    original_language: string;
    interpreted_text: string;
  };
  family_alert?: FamilyAlertResult;
  audio_base64?: string | null;
  audio_mime_type?: string | null;
  ollama_meta?: {
    model: string;
    inference_ms: number;
    local: boolean;
    provider?: string;
  };
  person_result?: {
    name: string;
    relationship: string;
    notes: string;
    photo_url: string | null;
  } | null;
};

type FamilyAlertResult = {
  sent: boolean;
  reason?: string;
  alert?: FamilyAlert;
  sms?: {
    attempted?: boolean;
    success?: boolean;
  };
};

type FamilyAlert = {
  id: string;
  timestamp: string;
  type: string;
  severity: string;
  message: string;
  caregiverName?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number | null;
    matchedPlace?: {
      name: string;
      distance_meters: number;
    } | null;
  };
};

type CareContact = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  language?: string;
  notes?: string;
  notify?: boolean;
};

type CareSettings = {
  home: {
    lat: number;
    lng: number;
    radiusMeters: number;
    address?: string;
    meaning?: string;
  };
  primaryCaregiver: CareContact | null;
  contacts: CareContact[];
};

type GemmaStatus = {
  local_inference: boolean;
  provider: string;
  model: string;
  api_model?: string;
  api_ready?: boolean;
  ollama_url: string;
  model_available: boolean;
  installed_models: string[];
  privacy: string;
  error?: string;
};

const roleOptions: { value: RoleName; label: string; emoji: string }[] = [
  { value: "patient", label: "Patient", emoji: "💛" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { value: "doctor", label: "Doctor", emoji: "🩺" }
];

const languageOptions = [
  "English",
  "Spanish",
  "French",
  "Hindi",
  "Bengali",
  "Arabic",
  "Urdu",
  "Chinese"
];

const demoSchedule: CareScheduleItem[] = [
  { time: "08:00", label: "Breakfast", careMoment: true, alarm: true, kind: "breakfast" },
  { time: "08:15", label: "Morning medication", careMoment: true, alarm: true, kind: "medication" },
  { time: "12:30", label: "Lunch", careMoment: true, alarm: true, kind: "lunch" },
  { time: "15:00", label: "Rest or family visit", careMoment: false, alarm: false, kind: "routine" },
  { time: "19:00", label: "Dinner", careMoment: true, alarm: true, kind: "dinner" },
  { time: "19:30", label: "Evening medication", careMoment: true, alarm: true, kind: "medication" },
  { time: "21:00", label: "Prepare for sleep", careMoment: false, alarm: false, kind: "routine" }
];

const protectedLogin = {
  family: { id: "family", password: "1234" },
  doctor: { id: "doctor", password: "1234" }
};

const SILENT_CHECK_COOLDOWN_MS = 45000;

// Activity-aware silence thresholds
// frozen   = was moving, suddenly stopped    → check after 90s
// settled  = slowed down after activity      → check after 3 min
// resting  = calm/still since monitor started → check after 6 min
// active   = currently moving               → no check
const SILENT_CHECK_MS: Record<string, number> = {
  frozen:  90_000,
  settled: 180_000,
  resting: 360_000,
  active:  999_999
};

function getSilentCareStage(checkCount: number) {
  if (checkCount <= 1) return "initial_guidance";
  if (checkCount === 2) return "check_in";
  if (checkCount === 3) return "hearing_check";
  if (checkCount === 4) return "caregiver_warning";
  return "alert";
}

export default function Home() {
  const [theme, setTheme] = useState<ThemeName>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("laptop");
  const [speakerRole, setSpeakerRole] = useState<RoleName>("patient");
  const [careMenuOpen, setCareMenuOpen] = useState(false);

  const [familyUnlocked, setFamilyUnlocked] = useState(false);
  const [doctorUnlocked, setDoctorUnlocked] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [userName, setUserName] = useState("Mary");
  const [mainLanguage, setMainLanguage] = useState("English");
  const [spokenLanguage, setSpokenLanguage] = useState("English");

  const [speechText, setSpeechText] = useState("");
  const [nearbyPerson, setNearbyPerson] = useState("");
  const [lastEvent, setLastEvent] = useState("");
  const [visualDescription, setVisualDescription] = useState("");
  const [imageLabels, setImageLabels] = useState("");
  const [visualConcern, setVisualConcern] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [activeCameraButton, setActiveCameraButton] =
    useState<CameraButtonName>("start");
  const [cameraStatus, setCameraStatus] = useState("Camera not started");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [careNote, setCareNote] = useState("Anna visits most afternoons.");
  const [doctorNote, setDoctorNote] = useState(
    "Take the blue pill after dinner."
  );
  const [clinicalAssessment, setClinicalAssessment] = useState(
    "Mild confusion episode; verify medication timing and hydration."
  );
  const [medicationPlan, setMedicationPlan] = useState(
    "Continue current evening dose unless caregiver reports missed or double dose."
  );
  const [followUpPlan, setFollowUpPlan] = useState(
    "Review repeated disorientation episodes at next visit."
  );
  const [photoMemories, setPhotoMemories] = useState<PhotoMemory[]>([]);
  const [patientNoteDraft, setPatientNoteDraft] = useState("");
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([]);
  const [patientNoteSaveState, setPatientNoteSaveState] =
    useState<"idle" | "saved">("idle");
  const [saveStatus, setSaveStatus] = useState("");
  const [saveButtonState, setSaveButtonState] = useState<"idle" | "saved">("idle");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState("GPS not started");
  const [gpsWatching, setGpsWatching] = useState(false);
  const [activeGpsButton, setActiveGpsButton] = useState<GpsButtonName>("get");

  const [now, setNow] = useState(new Date());
  const [careSchedule, setCareSchedule] = useState<CareScheduleItem[]>(demoSchedule);
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [activeReminder, setActiveReminder] = useState<CareScheduleItem | null>(null);
  const [dailyLog, setDailyLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [liveMonitoring, setLiveMonitoring] = useState(false);
  const [liveMonitoringStatus, setLiveMonitoringStatus] = useState(
    "Live monitor is off"
  );
  const [result, setResult] = useState<AssistResponse | null>(null);
  const [error, setError] = useState("");
  const [gemmaStatus, setGemmaStatus] = useState<GemmaStatus | null>(null);
  const [severityTrend, setSeverityTrend] = useState<SeverityTrend | null>(null);
  const [careSettings, setCareSettings] = useState<CareSettings | null>(null);
  const [settingsStatus, setSettingsStatus] = useState("");
  const [settingsButtonState, setSettingsButtonState] =
    useState<"idle" | "saving" | "saved">("idle");
  const [familyAlerts, setFamilyAlerts] = useState<FamilyAlert[]>([]);
  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [medicines, setMedicines] = useState<MedicineEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const gpsWatchIdRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const aiPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const movementIntervalRef = useRef<number | null>(null);
  const noMovementCountRef = useRef(0);
  const activityHistoryRef = useRef<boolean[]>([]); // true=moved, false=still, last 24 samples (60s)
  const lastActiveAtRef = useRef(0);               // timestamp of last detected movement
  const activityStateRef = useRef<"active"|"frozen"|"settled"|"resting">("resting");
  const cameraActiveRef = useRef(false);
  const cameraFailedRef = useRef(false);
  const lastAlarmKeyRef = useRef("");
  const speechRecognitionRef = useRef<any>(null);
  const liveMonitoringRef = useRef(false);
  const liveAssistInFlightRef = useRef(false);
  const liveAssistAbortRef = useRef<AbortController | null>(null);
  const assistantSpeakingRef = useRef(false);
  const speechResumeTimerRef = useRef<number | null>(null);
  const speechPlaybackIdRef = useRef(0);
  const audioMonitorStreamRef = useRef<MediaStream | null>(null);
  const audioMonitorContextRef = useRef<AudioContext | null>(null);
  const audioMonitorTimerRef = useRef<number | null>(null);
  const lastVoiceActivityStatusAtRef = useRef(0);
  const quietCheckIntervalRef = useRef<number | null>(null);
  const lastLiveSpeechAtRef = useRef(0);
  const lastQuietAssistAtRef = useRef(0);
  const liveMonitoringStartedAtRef = useRef(0);
  const liveMicErrorCountRef = useRef(0);
  const liveSpeechReadyRef = useRef(false);
  const liveRecognitionRestartRef = useRef<number | null>(null);
  const patientQuietModeRef = useRef(false);
  const quietCheckCountRef = useRef(0);
  const rolePanelRef = useRef<HTMLDivElement | null>(null);
  const conversationHistoryRef = useRef<Array<{role: "patient"|"assistant", text: string}>>([]);

  const currentTheme = theme === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    setHydrated(true);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!alarmEnabled) return;

    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    const reminder = careSchedule.find(
      (item) => item.alarm && item.time === currentTime
    );

    if (!reminder) return;

    const alarmKey = `${now.toDateString()}-${reminder.time}-${reminder.label}`;
    if (lastAlarmKeyRef.current === alarmKey) return;

    lastAlarmKeyRef.current = alarmKey;
    setActiveReminder(reminder);
    addLog(`Reminder: ${reminder.label}`);
    playReminderAlarm();
  }, [alarmEnabled, now, careSchedule]);

  useEffect(() => {
    fetch(apiUrl("/api/gemma/status"))
      .then((res) => res.json())
      .then((data: GemmaStatus) => setGemmaStatus(data))
      .catch(() => setGemmaStatus(null));
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("yourown-care-info");
      if (!saved) return;

      const data = JSON.parse(saved);
      if (typeof data.userName === "string") setUserName(data.userName);
      if (typeof data.mainLanguage === "string") setMainLanguage(data.mainLanguage);
      if (typeof data.spokenLanguage === "string") setSpokenLanguage(data.spokenLanguage);
      if (typeof data.nearbyPerson === "string") setNearbyPerson(data.nearbyPerson);
      if (typeof data.lastEvent === "string") setLastEvent(data.lastEvent);
      if (typeof data.careNote === "string") setCareNote(data.careNote);
      if (typeof data.doctorNote === "string") setDoctorNote(data.doctorNote);
      if (typeof data.clinicalAssessment === "string") {
        setClinicalAssessment(data.clinicalAssessment);
      }
      if (typeof data.medicationPlan === "string") setMedicationPlan(data.medicationPlan);
      if (typeof data.followUpPlan === "string") setFollowUpPlan(data.followUpPlan);
      if (Array.isArray(data.careSchedule)) setCareSchedule(data.careSchedule);
      if (Array.isArray(data.photoMemories)) setPhotoMemories(data.photoMemories);
      if (Array.isArray(data.patientNotes)) setPatientNotes(data.patientNotes);
    } catch {
      setSaveStatus("");
    }
  }, []);

  const fetchSeverityTrend = async () => {
    try {
      const res = await fetch(apiUrl("/doctor/mary/severity-trend"));
      if (!res.ok) return;
      const data: SeverityTrend = await res.json();
      setSeverityTrend(data);
    } catch {
      setSeverityTrend(null);
    }
  };

  const fetchCareSettings = async () => {
    try {
      const res = await fetch(apiUrl("/api/care-settings"));
      if (!res.ok) return;
      const data: CareSettings = await res.json();
      setCareSettings(data);
    } catch {
      setCareSettings(null);
    }
  };

  const fetchFamilyAlerts = async () => {
    try {
      const res = await fetch(apiUrl("/api/care-settings/alerts/mary"));
      if (!res.ok) return;
      const data: { alerts: FamilyAlert[] } = await res.json();
      setFamilyAlerts(data.alerts || []);
    } catch {
      setFamilyAlerts([]);
    }
  };

  useEffect(() => {
    fetchSeverityTrend();
    fetchCareSettings();
    fetchFamilyAlerts();
  }, []);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      speechRecognitionRef.current?.stop?.();
      if (quietCheckIntervalRef.current !== null) {
        window.clearInterval(quietCheckIntervalRef.current);
      }
    };
  }, []);

  const currentClock = hydrated ? now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  }) : "--:--";

  const timeOfDay = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    if (hour < 21) return "evening";
    return "night";
  }, [now]);

  const nextScheduleItem = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return (
      careSchedule.find((item) => {
        const [hour, minute] = item.time.split(":").map(Number);
        return hour * 60 + minute >= currentMinutes;
      }) || careSchedule[0]
    );
  }, [now, careSchedule]);

  const routineStatus = useMemo(() => {
    const hour = now.getHours();
    const minute = now.getMinutes();
    const total = hour * 60 + minute;

    if (total >= 450 && total <= 540) return "Breakfast and morning medicine window";
    if (total >= 720 && total <= 810) return "Lunch window";
    if (total >= 1110 && total <= 1200) return "Dinner and evening medicine window";

    return "No meal or medication due right now";
  }, [now]);

  const activeCareRoutine = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return (
      careSchedule.find((item) => {
        if (!item.careMoment) return false;
        const [hour, minute] = item.time.split(":").map(Number);
        const routineMinutes = hour * 60 + minute;
        return Math.abs(currentMinutes - routineMinutes) <= 45;
      }) || null
    );
  }, [now, careSchedule]);

  const nextAlarmReminder = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const alarms = careSchedule.filter((item) => item.alarm);

    return (
      alarms.find((item) => {
        const [hour, minute] = item.time.split(":").map(Number);
        return hour * 60 + minute >= currentMinutes;
      }) || alarms[0]
    );
  }, [now, careSchedule]);

  const autoContext = useMemo(() => {
    return [
      `Current time is ${currentClock}.`,
      `It is ${timeOfDay}.`,
      `Routine status: ${routineStatus}.`,
      activeCareRoutine
        ? `It is meal or medication time: ${activeCareRoutine.time} ${activeCareRoutine.label}.`
        : "Do not mention meals or medication unless the patient asks or the schedule says it is time.",
      latitude && longitude
        ? `GPS is active with accuracy ${Math.round(
            locationAccuracy || 0
          )} meters.`
        : "GPS is not active yet.",
      capturedImage
        ? "Camera frame is available for context."
        : cameraActive
          ? "Camera is active, but no frame has been captured yet."
          : "",
      visualDescription ? `Caregiver-entered visual context: ${visualDescription}.` : "",
      photoMemories.length
        ? `Face memory library: ${photoMemories
            .map((photo) =>
              [photo.name, photo.relationship, photo.description]
                .filter(Boolean)
                .join(" - ")
            )
            .filter(Boolean)
            .join("; ")}.`
        : "",
      nearbyPerson ? `Nearby known person: ${nearbyPerson}.` : "",
      lastEvent ? `Recent event: ${lastEvent}.` : "",
      speakerRole === "family" && careNote ? `Family note: ${careNote}.` : "",
      speakerRole === "doctor" && doctorNote
        ? `Doctor instruction: ${doctorNote}.`
        : "",
      speakerRole === "doctor" && clinicalAssessment
        ? `Clinical assessment: ${clinicalAssessment}.`
        : "",
      speakerRole === "doctor" && medicationPlan
        ? `Medication plan: ${medicationPlan}.`
        : "",
      speakerRole === "doctor" && followUpPlan
        ? `Follow-up plan: ${followUpPlan}.`
        : ""
    ]
      .filter(Boolean)
      .join(" ");
  }, [
    currentClock,
    timeOfDay,
    routineStatus,
    activeCareRoutine,
    latitude,
    longitude,
    locationAccuracy,
    capturedImage,
    cameraActive,
    visualDescription,
    photoMemories,
    nearbyPerson,
    lastEvent,
    speakerRole,
    careNote,
    doctorNote,
    clinicalAssessment,
    medicationPlan,
    followUpPlan
  ]);

  const isProtectedRoleLocked =
    (speakerRole === "family" && !familyUnlocked) ||
    (speakerRole === "doctor" && !doctorUnlocked);
  const isPatientRole = speakerRole === "patient";
  const isFamilyRole = speakerRole === "family";
  const isDoctorRole = speakerRole === "doctor";
  const isFamilyDashboard = isFamilyRole && familyUnlocked;
  const isDoctorDashboard = isDoctorRole && doctorUnlocked;
  const isCareTeamDashboard = isFamilyDashboard || isDoctorDashboard;

  const canModifyCareInfo =
    (speakerRole === "family" && familyUnlocked) ||
    (speakerRole === "doctor" && doctorUnlocked);

  const canModifySchedule =
    speakerRole === "patient" ||
    (speakerRole === "family" && familyUnlocked) ||
    (speakerRole === "doctor" && doctorUnlocked);

  useEffect(() => {
    if (!isFamilyDashboard) return;
    fetchCareSettings();
    fetchFamilyAlerts();
    fetchPeople();
    const timer = window.setInterval(fetchFamilyAlerts, 15000);
    return () => window.clearInterval(timer);
  }, [isFamilyDashboard]);

  const fetchPeople = async () => {
    setPeopleLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/people?patient=${encodeURIComponent(userName)}`));
      const data = await res.json();
      setPeople(data.people || []);
    } catch {
      setPeople([]);
    } finally {
      setPeopleLoading(false);
    }
  };

  const handleAddPersonToSupabase = async (formData: FormData) => {
    try {
      const res = await fetch(apiUrl("/api/people"), { method: "POST", body: formData });
      const data = await res.json();
      if (data.ok) fetchPeople();
    } catch { /* ignore */ }
  };

  const handleDeletePerson = async (id: string) => {
    try {
      await fetch(apiUrl(`/api/people/${id}`), { method: "DELETE" });
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
  };

  const updateScheduleItem = (
    index: number,
    field: "time" | "label",
    value: string
  ) => {
    setCareSchedule((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const saveCareInfo = () => {
    const data = {
      userName,
      mainLanguage,
      spokenLanguage,
      nearbyPerson,
      lastEvent,
      visualDescription,
      imageLabels,
      visualConcern,
      careNote,
      doctorNote,
      clinicalAssessment,
      medicationPlan,
      followUpPlan,
      careSchedule,
      photoMemories,
      patientNotes
    };

    window.localStorage.setItem("yourown-care-info", JSON.stringify(data));
    setSaveButtonState("saved");
    setSaveStatus("Saved");
    addLog("Care information saved");

    window.setTimeout(() => {
      setSaveButtonState("idle");
      setSaveStatus("");
    }, 1800);
  };

  const savePatientNote = () => {
    const text = patientNoteDraft.trim();
    if (!text) return;

    const note = {
      id: `note_${Date.now()}`,
      timestamp: new Date().toISOString(),
      text
    };
    const updatedNotes = [note, ...patientNotes].slice(0, 30);

    setPatientNotes(updatedNotes);
    setPatientNoteDraft("");
    setPatientNoteSaveState("saved");
    addLog("Patient note saved");

    let existing = {};
    try {
      const saved = window.localStorage.getItem("yourown-care-info");
      existing = saved ? JSON.parse(saved) : {};
    } catch {
      existing = {};
    }
    window.localStorage.setItem(
      "yourown-care-info",
      JSON.stringify({
        ...existing,
        patientNotes: updatedNotes
      })
    );

    window.setTimeout(() => setPatientNoteSaveState("idle"), 1800);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoMemories((items) => [
          ...items,
          {
            id: `${Date.now()}-${file.name}`,
            imageDataUrl: String(reader.result || ""),
            name: "",
            relationship: "",
            description: ""
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  };

  const updatePhotoMemory = (
    id: string,
    field: "name" | "relationship" | "description",
    value: string
  ) => {
    setPhotoMemories((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removePhotoMemory = (id: string) => {
    setPhotoMemories((items) => items.filter((item) => item.id !== id));
  };

  const updateHomeSetting = (
    field: "lat" | "lng" | "radiusMeters" | "address",
    value: string
  ) => {
    setCareSettings((settings) => {
      const current = settings || {
        home: { lat: 0, lng: 0, radiusMeters: 120, address: "" },
        primaryCaregiver: null,
        contacts: [blankCareContact()]
      };

      return {
        ...current,
        home: {
          ...current.home,
          [field]:
            field === "address"
              ? value
              : Number.isFinite(Number(value))
                ? Number(value)
                : 0
        }
      };
    });
  };

  const updateCaregiverSetting = (
    index: number,
    field: "name" | "relationship" | "phone" | "email" | "notes",
    value: string
  ) => {
    setCareSettings((settings) => {
      const current = settings || {
        home: { lat: 0, lng: 0, radiusMeters: 120, address: "" },
        primaryCaregiver: null,
        contacts: []
      };
      const contacts = [...(current.contacts?.length ? current.contacts : [blankCareContact()])];
      contacts[index] = {
        ...(contacts[index] || blankCareContact()),
        [field]: value
      };

      return {
        ...current,
        primaryCaregiver: contacts[0] || null,
        contacts
      };
    });
  };

  const updateCaregiverNotify = (index: number, notify: boolean) => {
    setCareSettings((settings) => {
      const current = settings || {
        home: { lat: 0, lng: 0, radiusMeters: 120, address: "" },
        primaryCaregiver: null,
        contacts: []
      };
      const contacts = [...(current.contacts?.length ? current.contacts : [blankCareContact()])];
      contacts[index] = {
        ...(contacts[index] || blankCareContact()),
        notify
      };

      return {
        ...current,
        primaryCaregiver: contacts[0] || null,
        contacts
      };
    });
  };

  const addCaregiverContact = () => {
    setCareSettings((settings) => {
      const current = settings || {
        home: { lat: 0, lng: 0, radiusMeters: 120, address: "" },
        primaryCaregiver: null,
        contacts: []
      };
      const contacts = [...(current.contacts || []), blankCareContact()];
      return {
        ...current,
        primaryCaregiver: contacts[0] || null,
        contacts
      };
    });
  };

  const removeCaregiverContact = (index: number) => {
    setCareSettings((settings) => {
      const current = settings || {
        home: { lat: 0, lng: 0, radiusMeters: 120, address: "" },
        primaryCaregiver: null,
        contacts: []
      };
      const contacts = (current.contacts || []).filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        primaryCaregiver: contacts[0] || null,
        contacts
      };
    });
  };

  const useCurrentGpsAsHome = () => {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      setSettingsStatus("Get live GPS first, then save it as home.");
      return;
    }

    setCareSettings((settings) => {
      const current = settings || {
        home: { lat: latitude, lng: longitude, radiusMeters: 120, address: "" },
        primaryCaregiver: null,
        contacts: [blankCareContact()]
      };

      return {
        ...current,
        home: {
          ...current.home,
          lat: Number(latitude.toFixed(6)),
          lng: Number(longitude.toFixed(6)),
          radiusMeters: current.home.radiusMeters || 120
        }
      };
    });
    setSettingsStatus("Current GPS copied into home settings.");
  };

  const saveCareSettings = async () => {
    if (!careSettings) return;

    setSettingsButtonState("saving");
    setSettingsStatus("Saving alert setup...");

    try {
      const res = await fetch(apiUrl("/api/care-settings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(careSettings)
      });

      const data: CareSettings & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save settings");

      setCareSettings(data);
      setSettingsButtonState("saved");
      setSettingsStatus("Saved");
      await fetchFamilyAlerts();
      window.setTimeout(() => {
        setSettingsButtonState("idle");
        setSettingsStatus("");
      }, 1800);
    } catch (err: unknown) {
      setSettingsButtonState("idle");
      setSettingsStatus(
        err instanceof Error ? err.message : "Could not save alert setup."
      );
    }
  };

  const getLiveCompanionText = () =>
    speechText.trim() ||
    "The patient is quiet. Use live microphone status, GPS, time, and any camera context to explain what is happening right now. Do not invent details.";

  const getPayload = () => ({
    profile: {
      userName,
      mainLanguage
    },
    signals: {
      speakerRole,
      spokenLanguage,
      speechText: getLiveCompanionText(),
      latitude,
      longitude,
      locationAccuracy,
      timeOfDay,
      currentTime: now.toISOString(),
      currentClock,
      nearbyPerson,
      lastEvent,
      room: "auto-detected or unknown",
      locationName: "",
      objects: imageLabels
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      visualDescription,
      visualConcern,
      capturedImage,
      imageLabels: imageLabels
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      scheduleNow: activeCareRoutine,
      routineStatus,
      mealOrMedicationTime: Boolean(activeCareRoutine),
      autoContext,
      dailyLog,
      careNote,
      doctorNote,
      clinicalAssessment,
      medicationPlan,
      followUpPlan,
      photoMemories: photoMemories.map(({ imageDataUrl, ...photo }) => photo),
      patientNotes: patientNotes.slice(0, 5).map(({ id, timestamp, text }) => ({
        id,
        timestamp,
        text
      })),
      conversationHistory: conversationHistoryRef.current.slice(-6)
    }
  });

  const addLog = (text: string) => {
    setDailyLog((prev) => [
      `${currentClock} - ${text}`,
      ...prev.slice(0, 9)
    ]);
  };

  const playReminderAlarm = () => {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    try {
      const audioContext = new AudioContextClass();
      const gain = audioContext.createGain();
      gain.gain.value = 0.08;
      gain.connect(audioContext.destination);

      [0, 0.35, 0.7].forEach((offset) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        oscillator.connect(gain);
        oscillator.start(audioContext.currentTime + offset);
        oscillator.stop(audioContext.currentTime + offset + 0.2);
      });
    } catch {
      setActiveReminder((current) => current);
    }
  };

  const enableCareAlarms = () => {
    setAlarmEnabled(true);
    playReminderAlarm();
  };

  const playAudio = async (data: AssistResponse) => {
    if (patientQuietModeRef.current) return;
    const playbackId = speechPlaybackIdRef.current + 1;
    speechPlaybackIdRef.current = playbackId;

    const spokenText = [
      data.response?.reassurance,
      data.response?.context,
      data.response?.next_step
    ]
      .filter(Boolean)
      .join(" ");

    const pauseLiveMic = () => {
      assistantSpeakingRef.current = true;
      if (speechResumeTimerRef.current !== null) {
        window.clearTimeout(speechResumeTimerRef.current);
        speechResumeTimerRef.current = null;
      }
      try {
        speechRecognitionRef.current?.stop?.();
      } catch {
        // Ignore browser speech-recognition stop races.
      }
    };

    const resumeLiveMic = () => {
      if (speechPlaybackIdRef.current !== playbackId) return;
      if (!liveMonitoringRef.current || !speechRecognitionRef.current) {
        assistantSpeakingRef.current = false;
        return;
      }

      // Keep assistantSpeakingRef true during the full delay so buffered TTS echo
      // in the speech recognition queue is dropped, not sent back as patient speech.
      speechResumeTimerRef.current = window.setTimeout(() => {
        speechResumeTimerRef.current = null;
        assistantSpeakingRef.current = false;
        lastLiveSpeechAtRef.current = Date.now();
        if (!liveMonitoringRef.current || !speechRecognitionRef.current) return;
        try {
          speechRecognitionRef.current.start();
          liveSpeechReadyRef.current = true;
        } catch {
          setLiveMonitoringStatus("Live mic is waiting to resume.");
        }
      }, 4000);
    };

    if (!data.audio_base64 || !data.audio_mime_type) {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (!spokenText) return;

      pauseLiveMic();
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 0.82;
      utterance.pitch = 1;
      utterance.volume = 1;

      await new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resumeLiveMic();
          resolve();
        };

        utterance.onend = () => {
          finish();
        };
        utterance.onerror = () => {
          finish();
        };
        window.setTimeout(finish, Math.max(2500, spokenText.length * 95));
        window.setTimeout(() => window.speechSynthesis.speak(utterance), 120);
      });
      return;
    }

    pauseLiveMic();
    const audio = new Audio(
      `data:${data.audio_mime_type};base64,${data.audio_base64}`
    );

    await new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resumeLiveMic();
        resolve();
      };

      audio.onended = () => {
        finish();
      };
      audio.onerror = () => {
        finish();
      };
      audio.play().catch(() => {
        finish();
      });
    });
  };

  const unlockRole = () => {
    if (speakerRole === "family") {
      const ok =
        loginId === protectedLogin.family.id &&
        loginPassword === protectedLogin.family.password;

      if (ok) {
        setFamilyUnlocked(true);
        setLoginId("");
        setLoginPassword("");
        setError("");
      } else {
        setError("Wrong family ID or password.");
      }
    }

    if (speakerRole === "doctor") {
      const ok =
        loginId === protectedLogin.doctor.id &&
        loginPassword === protectedLogin.doctor.password;

      if (ok) {
        setDoctorUnlocked(true);
        setLoginId("");
        setLoginPassword("");
        setError("");
      } else {
        setError("Wrong doctor ID or password.");
      }
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS is not supported in this browser.");
      return;
    }

    setActiveGpsButton("get");
    setGpsStatus("Getting GPS location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationAccuracy(position.coords.accuracy);
        setGpsStatus(
          `GPS ready - ${position.coords.latitude.toFixed(
            5
          )}, ${position.coords.longitude.toFixed(5)} - ${Math.round(
            position.coords.accuracy
          )}m`
        );
      },
      () => setGpsStatus("GPS permission denied or unavailable."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const toggleGpsWatch = () => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS is not supported in this browser.");
      return;
    }

    setActiveGpsButton("live");

    if (gpsWatching && gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
      setGpsWatching(false);
      setGpsStatus("Live GPS stopped.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationAccuracy(position.coords.accuracy);
        setGpsStatus(
          `Live GPS - ${position.coords.latitude.toFixed(
            5
          )}, ${position.coords.longitude.toFixed(5)} - ${Math.round(
            position.coords.accuracy
          )}m`
        );
      },
      () => setGpsStatus("Live GPS permission denied or unavailable."),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    gpsWatchIdRef.current = watchId;
    setGpsWatching(true);
  };

  const ensureGpsWatching = () => {
    if (gpsWatching || gpsWatchIdRef.current !== null) return;
    toggleGpsWatch();
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("Camera is not supported in this browser.");
      return;
    }

    setActiveCameraButton("start");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        },
        audio: false
      });

      cameraStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      cameraFailedRef.current = false;
      cameraActiveRef.current = true;
      setCameraActive(true);
      setCameraStatus("Camera active");
      startMovementDetection();
    } catch {
      cameraFailedRef.current = true;
      setCameraStatus("Camera unavailable — voice-only monitoring active.");
    }
  };

  const stopCamera = () => {
    setActiveCameraButton("stop");
    stopMovementDetection();
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    cameraActiveRef.current = false;
    setCameraActive(false);
    setCameraStatus("Camera stopped");
  };

  const captureCameraFrame = () => {
    setActiveCameraButton("capture");
    const video = videoRef.current;

    if (!video || !cameraActive || video.videoWidth === 0) {
      setCameraStatus("Start the camera before capturing.");
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraStatus("Could not capture camera frame.");
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.82);
    setCapturedImage(imageData);
    setVisualDescription("");
    setImageLabels("");
    setVisualConcern("");
    setCameraStatus("Analyzing scene with Gemma 4...");

    // Auto-analyze with Gemma 4 vision — fills description + labels + concern
    fetch(apiUrl("/api/vision"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageData,
        patientName: userName || "patient",
        source: "capture"
      })
    })
      .then(r => r.json())
      .then(analysis => {
        if (analysis.description) setVisualDescription(analysis.description);
        if (analysis.labels?.length) setImageLabels(analysis.labels.join(", "));
        if (analysis.concern && analysis.concern !== "none") setVisualConcern(analysis.concern);
        setCameraStatus("Scene analyzed and saved. Description and labels are filled.");
      })
      .catch(() => setCameraStatus("Frame captured. Vision analysis unavailable — fill labels manually."));

    return imageData;
  };

  // ── Movement detection ────────────────────────────────────────────────────
  // Compares consecutive low-res frames; if pixel diff < threshold → no movement
  const sampleFrameData = (): Uint8ClampedArray | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 80; canvas.height = 60; // low-res for performance
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, 80, 60);
    return ctx.getImageData(0, 0, 80, 60).data;
  };

  const computeActivityState = () => {
    const history = activityHistoryRef.current;
    const now = Date.now();
    const lastActive = lastActiveAtRef.current;
    const msSinceActive = lastActive > 0 ? now - lastActive : Infinity;

    // Any movement in the last 12.5s (5 samples) = currently active
    const recentlyActive = history.slice(-5).some(Boolean);
    if (recentlyActive) return "active" as const;

    // Was active in last 2 minutes but not in last 12.5s = frozen (sudden stop)
    if (msSinceActive < 120_000) return "frozen" as const;

    // Was active 2-5 minutes ago = settled (sat down after doing something)
    if (msSinceActive < 300_000) return "settled" as const;

    // Still for 5+ minutes = resting (watching TV, reading, sleeping)
    return "resting" as const;
  };

  const startMovementDetection = () => {
    if (movementIntervalRef.current !== null) return;
    noMovementCountRef.current = 0;
    prevFrameDataRef.current = null;
    activityHistoryRef.current = [];
    lastActiveAtRef.current = 0;
    activityStateRef.current = "resting";

    movementIntervalRef.current = window.setInterval(() => {
      const curr = sampleFrameData();
      if (!curr) return;
      const prev = prevFrameDataRef.current;
      if (prev) {
        let diff = 0;
        for (let i = 0; i < prev.length; i += 4) {
          diff += Math.abs(prev[i] - curr[i]) + Math.abs(prev[i+1] - curr[i+1]) + Math.abs(prev[i+2] - curr[i+2]);
        }
        const avgDiff = diff / (prev.length / 4);
        const moved = avgDiff >= 8;

        // Maintain rolling 24-sample (60s) history
        activityHistoryRef.current = [...activityHistoryRef.current.slice(-23), moved];

        if (moved) {
          noMovementCountRef.current = 0;
          lastActiveAtRef.current = Date.now();
        } else {
          noMovementCountRef.current += 1;
        }

        activityStateRef.current = computeActivityState();
      }
      prevFrameDataRef.current = curr;
    }, 2500);
  };

  const stopMovementDetection = () => {
    if (movementIntervalRef.current !== null) {
      window.clearInterval(movementIntervalRef.current);
      movementIntervalRef.current = null;
    }
    noMovementCountRef.current = 0;
    prevFrameDataRef.current = null;
    activityHistoryRef.current = [];
    lastActiveAtRef.current = 0;
    activityStateRef.current = "resting";
  };

  // ── Photo → AI explain ────────────────────────────────────────────────────
  const handleAiPhotoExplain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setLoading(true);
      setError("");
      setResult(null);
      try {
        const payload = getPayload();
        const res = await fetch(apiUrl("/assist"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            signals: {
              ...payload.signals,
              capturedImage: dataUrl,
              speechText: "What do you see in this picture? Please describe it simply.",
              visualDescription: "Patient uploaded a photo and wants it described."
            }
          })
        });
        const data: AssistResponse & { error?: string } = await res.json();
        if (!res.ok) throw new Error(data?.error || "Request failed");
        setResult(data);
        setCapturedImage(dataUrl);
        await playAudio(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not analyse photo");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAssist = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(apiUrl("/assist"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(getPayload())
      });

      const data: AssistResponse & { error?: string } = await res.json();

      if (!res.ok) throw new Error(data?.error || "Request failed");

      setResult(data);
      if (speechText.trim()) {
        const aiText = data.companion_message || (data as any).response?.reassurance || "";
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          { role: "patient" as const, text: speechText.trim() },
          ...(aiText ? [{ role: "assistant" as const, text: aiText }] : [])
        ].slice(-10);
      }
      addLog(speechText.trim() ? `Asked: ${speechText}` : "Live companion check");
      fetchSeverityTrend();
      await playAudio(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not connect to backend";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const sendLiveMonitoringAssist = async (
    transcript: string,
    source: "speech" | "quiet_check" = "speech"
  ) => {
    if (liveAssistInFlightRef.current) {
      // Patient spoke while a silent check was in-flight — cancel the check and respond to speech instead
      if (source === "speech" && liveAssistAbortRef.current) {
        liveAssistAbortRef.current.abort();
        liveAssistInFlightRef.current = false;
      } else {
        return;
      }
    }

    const abortController = new AbortController();
    liveAssistAbortRef.current = abortController;
    liveAssistInFlightRef.current = true;
    setLoading(true);
    setError("");
    if (source === "speech") {
      setSpeechText(transcript);
    }

    try {
      const liveFrame =
        source === "quiet_check" && cameraActive
          ? captureCameraFrame()
          : capturedImage;
      const payload = getPayload();
      const realNoMovement = cameraActive && noMovementCountRef.current >= 2;
      const behaviorSignals = source === "quiet_check"
        ? {
            noProgress: realNoMovement || !cameraActive,
            quietPause: true,
            hesitation: true,
            repeatedSilentCheck: quietCheckCountRef.current > 1,
            liveSilenceCheckCount: quietCheckCountRef.current,
            gpsAvailable: latitude !== null && longitude !== null,
            cameraAvailable: cameraActive && !cameraFailedRef.current,
            cameraFailed: cameraFailedRef.current,
            capturedImageAvailable: Boolean(liveFrame || capturedImage),
            movementDetected: cameraActive && noMovementCountRef.current === 0,
            noMovementCount: noMovementCountRef.current,
            activityState: activityStateRef.current,
            microphoneStatus: liveMicErrorCountRef.current > 0 ? "unstable_or_blocked" : "available",
            source: cameraActiveRef.current && !cameraFailedRef.current ? "movement_detector" : "mic_gps"
          }
        : { hesitation: hasHesitationPattern(transcript), source: "speech" };
      const conversationState = source === "quiet_check"
        ? {
            turnType: "silent_check",
            stage: getSilentCareStage(quietCheckCountRef.current),
            silentCheckCount: quietCheckCountRef.current,
            monitorInstruction: transcript,
            goal:
              "Code controls the safety stage. Gemma controls natural wording for this stage. Talk like a real caregiver, use saved context naturally, ask one fresh question, and do not repeat prior wording.",
            patientMayBeResting: patientQuietModeRef.current,
            shouldEscalateCaregiver: quietCheckCountRef.current >= 4
          }
        : {
            turnType: "patient_speech",
            stage: "conversation",
            lastPatientAnswer: transcript,
            goal:
              "Respond naturally to what the patient just said, like a calm caregiver companion."
          };
      const res = await fetch(apiUrl("/assist"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: abortController.signal,
        body: JSON.stringify({
          ...payload,
          signals: {
            ...payload.signals,
            speakerRole: "patient",
            speechText: source === "quiet_check" ? "" : transcript,
            capturedImage: liveFrame || payload.signals.capturedImage,
            visualDescription: liveFrame
              ? "Live monitor captured a fresh camera frame for safety context."
              : payload.signals.visualDescription,
            behaviorSignals,
            conversationState
          }
        })
      });

      const data: AssistResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data?.error || "Live monitor request failed");

      setResult(data);
      if (source === "speech" && transcript) {
        const aiText = data.companion_message || (data as any).response?.reassurance || "";
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          { role: "patient" as const, text: transcript },
          ...(aiText ? [{ role: "assistant" as const, text: aiText }] : [])
        ].slice(-10);
      }
      setLiveMonitoringStatus(
        source === "quiet_check"
          ? "Silent pause support was generated."
          : "Live monitor generated support."
      );
      addLog(
        source === "quiet_check"
          ? "Live monitor noticed quiet uncertainty"
          : `Live monitor heard: ${transcript}`
      );
      fetchSeverityTrend();
      await playAudio(data);
    } catch (err: unknown) {
      // Silently drop aborted requests — they were cancelled intentionally by patient speech
      if (err instanceof Error && err.name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Could not process live monitoring";
      setError(message);
    } finally {
      liveAssistInFlightRef.current = false;
      liveAssistAbortRef.current = null;
      setLoading(false);
    }
  };

  const clearQuietCheckTimer = () => {
    if (quietCheckIntervalRef.current === null) return;
    window.clearInterval(quietCheckIntervalRef.current);
    quietCheckIntervalRef.current = null;
  };

  const stopAudioActivityMonitor = () => {
    if (audioMonitorTimerRef.current !== null) {
      window.clearInterval(audioMonitorTimerRef.current);
      audioMonitorTimerRef.current = null;
    }

    audioMonitorStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioMonitorStreamRef.current = null;

    audioMonitorContextRef.current?.close().catch(() => undefined);
    audioMonitorContextRef.current = null;
  };

  const startAudioActivityMonitor = async () => {
    stopAudioActivityMonitor();

    if (!navigator.mediaDevices?.getUserMedia) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }

      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const samples = new Uint8Array(analyser.fftSize);
      audioMonitorStreamRef.current = stream;
      audioMonitorContextRef.current = audioContext;
      liveSpeechReadyRef.current = true;
      lastLiveSpeechAtRef.current = Date.now();

      audioMonitorTimerRef.current = window.setInterval(() => {
        if (!liveMonitoringRef.current || assistantSpeakingRef.current) return;

        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) {
          const centered = sample - 128;
          sum += centered * centered;
        }

        const rms = Math.sqrt(sum / samples.length);
        if (rms < 8) return;

        lastLiveSpeechAtRef.current = Date.now();
        const nowMs = Date.now();
        if (nowMs - lastVoiceActivityStatusAtRef.current > 3000) {
          lastVoiceActivityStatusAtRef.current = nowMs;
          setLiveMonitoringStatus("Voice activity detected. Listening for words...");
        }
      }, 250);

      return true;
    } catch {
      return false;
    }
  };

  const startQuietCheckTimer = () => {
    clearQuietCheckTimer();
    lastLiveSpeechAtRef.current = Date.now();
    lastQuietAssistAtRef.current = 0;
    quietCheckCountRef.current = 0;

    quietCheckIntervalRef.current = window.setInterval(() => {
      if (!liveMonitoringRef.current || liveAssistInFlightRef.current) return;
      if (patientQuietModeRef.current) return;
      if (!liveSpeechReadyRef.current) {
        const waitingForMs = Date.now() - liveMonitoringStartedAtRef.current;
        if (waitingForMs < 5000) {
          setLiveMonitoringStatus("Live monitor is checking microphone access...");
          return;
        }

        liveSpeechReadyRef.current = true;
        lastLiveSpeechAtRef.current = Date.now();
        setLiveMonitoringStatus("Mic readiness was slow. Silent pause checks are active now.");
        return;
      }

      const nowMs = Date.now();
      const quietForMs = nowMs - lastLiveSpeechAtRef.current;
      const quietCooldownMs = nowMs - lastQuietAssistAtRef.current;

      const cameraUsable = cameraActiveRef.current && !cameraFailedRef.current;
      const threshold = cameraUsable
        ? (SILENT_CHECK_MS[activityStateRef.current] ?? 180_000)
        : 90_000; // camera off or failed → mic+GPS only, check sooner
      if (
        quietForMs < threshold ||
        quietCooldownMs < SILENT_CHECK_COOLDOWN_MS
      ) return;

      lastQuietAssistAtRef.current = nowMs;
      const checkIns = [
        "Silent check. The patient has been quiet. Use context naturally and ask one gentle question.",
        "Silent check. The patient is still quiet. Do not repeat yourself. Continue like a real caregiver.",
        "Silent check. The patient has not answered. Ask a more specific safety question.",
        "Silent check. The patient is still not answering. Offer caregiver help naturally.",
        "Silent check. The patient has missed several check-ins. Calmly explain caregiver escalation may happen."
      ];
      const quietPrompt = checkIns[quietCheckCountRef.current % checkIns.length];
      quietCheckCountRef.current += 1;

      setLiveMonitoringStatus("Quiet pause noticed. Checking context gently...");
      sendLiveMonitoringAssist(quietPrompt, "quiet_check");
    }, 5000);
  };

  const startLiveMonitoring = async () => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    setLiveMonitoringStatus("Checking microphone access...");
    const microphone = await checkMicrophoneAccess();
    setLiveMonitoringStatus("Checking GPS access...");
    ensureGpsWatching();
    setLiveMonitoringStatus("Checking camera access...");
    if (!cameraActive) {
      await startCamera();
    }

    if (!microphone.ok) {
      setLiveMonitoringStatus(`${microphone.message} Silent pause timer can still run if you continue.`);
    }

    if (!SpeechRecognitionClass) {
      setLiveMonitoringStatus(
        `${microphone.message} Speech recognition is not supported in this browser. Type in the message box or use Speak.`
      );
      return;
    }

    liveMonitoringRef.current = true;
    setLiveMonitoring(true);
    liveMicErrorCountRef.current = 0;
    liveSpeechReadyRef.current = microphone.ok;
    liveMonitoringStartedAtRef.current = Date.now();
    lastLiveSpeechAtRef.current = Date.now();
    setLiveMonitoringStatus(
      microphone.ok
        ? "Microphone works. Listening for confusion and safety concerns..."
        : "Microphone unavailable. Silent pause timer is watching quietly."
    );

    if (!microphone.ok) {
      return;
    }

    // Audio monitor opens its own mic stream — running it alongside speech recognition
    // causes aborted errors. Skip it; the quiet timer uses speech recognition's onresult instead.
    startQuietCheckTimer();

    const langTag = spokenLanguage && spokenLanguage !== "English" ? spokenLanguage : "en-US";

    const createRecognition = () => {
      if (!liveMonitoringRef.current) return;

      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = langTag;

      rec.onresult = (event: any) => {
        // Always update the timestamp so quiet timer doesn't fire while patient is speaking
        lastLiveSpeechAtRef.current = Date.now();
        // Don't send to AI while TTS is playing, but keep listening
        if (assistantSpeakingRef.current) return;

        const results = Array.from(event.results || []) as any[];
        const transcript = results
          .slice(event.resultIndex || 0)
          .map((result) => String(result?.[0]?.transcript || ""))
          .join(" ")
          .trim();
        if (!transcript) return;

        const isFinal = results.some((result) => Boolean(result?.isFinal));
        setLiveMonitoringStatus(
          isFinal ? `Heard: ${transcript}` : `Listening: ${transcript}`
        );

        if (!isFinal) return;

        liveMicErrorCountRef.current = 0;

        if (isRestOrStopSpeech(transcript)) {
          patientQuietModeRef.current = true;
          quietCheckCountRef.current = 0;
          window.speechSynthesis?.cancel?.();
          setLiveMonitoringStatus("Mary said she is resting. I will stay quiet and keep listening.");
          addLog(`Resting mode: ${transcript}`);
          return;
        }

        if (patientQuietModeRef.current) {
          patientQuietModeRef.current = false;
          lastLiveSpeechAtRef.current = Date.now();
          setLiveMonitoringStatus(`Mary started talking again: ${transcript}`);
        }

        sendLiveMonitoringAssist(transcript);
      };

      rec.onerror = (event: any) => {
        const errorName = String(event?.error || "");

        if (errorName === "not-allowed" || errorName === "service-not-allowed") {
          liveSpeechReadyRef.current = false;
          setLiveMonitoringStatus("Microphone permission is blocked. Type in the message box or use Speak.");
          return;
        }

        // These are transient — browser fires them during silence or brief server hiccups.
        // Don't count them; just let onend restart the recognition.
        if (errorName === "no-speech" || errorName === "network") return;

        liveMicErrorCountRef.current += 1;
        if (liveMicErrorCountRef.current <= 2) {
          setLiveMonitoringStatus(`Live mic paused (${errorName}). Restarting...`);
        }
      };

      rec.onend = () => {
        if (!liveMonitoringRef.current) return;
        if (liveMicErrorCountRef.current > 12) {
          liveSpeechReadyRef.current = false;
          setLiveMonitoringStatus("Live mic is unstable. Type in the message box or use Speak.");
          return;
        }

        // Don't auto-restart while TTS is playing — resumeLiveMic will restart it
        // manually after the echo-guard delay. Auto-restarting here would create a new
        // recognition instance that immediately picks up speaker output as patient speech.
        if (assistantSpeakingRef.current) return;

        if (liveRecognitionRestartRef.current !== null) return;
        // Delay before creating fresh instance — browser needs time to fully close the old one
        liveRecognitionRestartRef.current = window.setTimeout(() => {
          liveRecognitionRestartRef.current = null;
          createRecognition();
        }, 300);
      };

      speechRecognitionRef.current = rec;
      try {
        rec.start();
      } catch {
        if (liveMicErrorCountRef.current <= 1) {
          setLiveMonitoringStatus("Live mic is waiting to restart.");
        }
      }
    };

    liveSpeechReadyRef.current = true;
    lastLiveSpeechAtRef.current = Date.now();
    createRecognition();
  };

  const stopLiveMonitoring = () => {
    liveMonitoringRef.current = false;
    setLiveMonitoring(false);
    setLiveMonitoringStatus("Live monitor is off");
    liveSpeechReadyRef.current = false;
    assistantSpeakingRef.current = false;
    if (speechResumeTimerRef.current !== null) {
      window.clearTimeout(speechResumeTimerRef.current);
      speechResumeTimerRef.current = null;
    }
    patientQuietModeRef.current = false;
    if (liveRecognitionRestartRef.current !== null) {
      window.clearTimeout(liveRecognitionRestartRef.current);
      liveRecognitionRestartRef.current = null;
    }
    clearQuietCheckTimer();
    stopAudioActivityMonitor();
    speechRecognitionRef.current?.stop?.();
  };

  const toggleLiveMonitoring = () => {
    if (liveMonitoring) {
      stopLiveMonitoring();
    } else {
      startLiveMonitoring();
    }
  };

  const isConfusionOrSafetySpeech = (text: string) =>
    /\b(where am i|who am i|who are you|lost|scared|afraid|confused|unsure|don't know|dont know|what was i|what do i|help|hurt|fall|fell|pain|medicine|pill|dose|home)\b/i.test(
      text
    ) || hasHesitationPattern(text);

  const isRestOrStopSpeech = (text: string) =>
    /\b(i am okay|i'm okay|im okay|i am fine|i'm fine|im fine|i will sleep|i'm going to sleep|im going to sleep|going to sleep|i want to sleep|let me sleep|i am resting|i'm resting|im resting|i will rest|i am watching tv|watching tv|stop talking|be quiet|quiet please|don't talk|dont talk|no more help|i don't need help|i dont need help)\b/i.test(
      text
    );

  const hasHesitationPattern = (text: string) => {
    const normalized = text.toLowerCase().replace(/[^\w\s']/g, " ");
    const words = normalized.split(/\s+/).filter(Boolean);
    if (words.length < 3) return false;

    const repeatedWordCount = words.filter(
      (word, index) => index > 0 && word === words[index - 1]
    ).length;

    return (
      repeatedWordCount >= 2 ||
      /\b(um|uh|wait|i forgot|i can't remember|i cant remember|what was i saying|never mind)\b/i.test(
        text
      )
    );
  };

  const handleQuickPrompt = async (
    prompt: string,
    visualOverrides?: {
      description?: string;
      labels?: string;
      concern?: string;
    }
  ) => {
    setSpeakerRole("patient");
    setSpeechText(prompt);

    if (visualOverrides?.description !== undefined) {
      setVisualDescription(visualOverrides.description);
    }

    if (visualOverrides?.labels !== undefined) {
      setImageLabels(visualOverrides.labels);
    }

    if (visualOverrides?.concern !== undefined) {
      setVisualConcern(visualOverrides.concern);
    }

    setLoading(true);
    setError("");
    setResult(null);

    const labels = (visualOverrides?.labels ?? imageLabels)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const res = await fetch(apiUrl("/assist"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...getPayload(),
          signals: {
            ...getPayload().signals,
            speakerRole: "patient",
            speechText: prompt,
            visualDescription:
              visualOverrides?.description ?? visualDescription,
            visualConcern: visualOverrides?.concern ?? visualConcern,
            imageLabels: labels,
            objects: labels
          }
        })
      });

      const data: AssistResponse & { error?: string } = await res.json();

      if (!res.ok) throw new Error(data?.error || "Request failed");

      setResult(data);
      addLog(`Quick help: ${prompt}`);
      await playAudio(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not connect to backend";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    setError("");
    setResult(null);

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    // Use browser Web Speech API — free, no ElevenLabs key needed
    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = spokenLanguage && spokenLanguage !== "English" ? spokenLanguage : "en-US";

      let capturedTranscript = "";

      rec.onresult = (event: any) => {
        const results = Array.from(event.results || []) as any[];
        const transcript = results
          .map((r) => String(r?.[0]?.transcript || ""))
          .join(" ")
          .trim();
        if (transcript) {
          capturedTranscript = transcript;
          setSpeechText(transcript);
        }
      };

      rec.onend = async () => {
        setRecording(false);
        if (!capturedTranscript) return;
        setLoading(true);
        setError("");
        try {
          const payload = getPayload();
          const res = await fetch(apiUrl("/assist"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              signals: { ...payload.signals, speechText: capturedTranscript }
            })
          });
          const data: AssistResponse & { error?: string } = await res.json();
          if (!res.ok) throw new Error(data?.error || "Request failed");
          setSpeechText(capturedTranscript);
          setResult(data);
          addLog(`Heard: ${capturedTranscript}`);
          fetchSeverityTrend();
          await playAudio(data);
          const aiText = data.companion_message || (data as any).response?.reassurance || "";
          conversationHistoryRef.current = [
            ...conversationHistoryRef.current,
            { role: "patient" as const, text: capturedTranscript },
            ...(aiText ? [{ role: "assistant" as const, text: aiText }] : [])
          ].slice(-10);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : "Could not process voice");
        } finally {
          setLoading(false);
        }
      };

      rec.onerror = (event: any) => {
        const err = String(event?.error || "");
        // no-speech: user didn't say anything — reset silently.
        if (err === "no-speech") {
          setRecording(false);
          return;
        }
        // network: Chrome couldn't reach Google's speech servers — transient.
        // Show a soft hint so the patient knows to try again or type instead.
        if (err === "network") {
          setRecording(false);
          setError("Couldn't catch that — please tap Speak again or type your message.");
          return;
        }
        if (err === "not-allowed" || err === "service-not-allowed") {
          setError("Microphone access was denied. Please allow microphone in your browser settings.");
        } else {
          setError("Could not hear you. Please tap Speak and try again.");
        }
        setRecording(false);
      };

      rec.start();
      setRecording(true);
      return;
    }

    // Fallback: MediaRecorder + ElevenLabs (only if Web Speech unavailable)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendVoiceToBackend(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      setError("Microphone permission failed. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    // Stop Web Speech recognition if active
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass && recording) {
      // onend fires automatically and calls handleAssist
      setRecording(false);
      return;
    }
    if (!mediaRecorderRef.current) return;
    setRecording(false);
    setLoading(true);
    mediaRecorderRef.current.stop();
  };

  const checkMicrophoneAccess = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return {
        ok: false,
        message: "Microphone access is not supported in this browser."
      };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return {
        ok: true,
        message: "Microphone is available."
      };
    } catch (error: unknown) {
      const errorName = error instanceof DOMException ? error.name : "";
      const message =
        errorName === "NotAllowedError" || errorName === "SecurityError"
          ? "Microphone permission is blocked. Allow microphone access in the browser."
          : errorName === "NotFoundError"
            ? "No microphone was found on this device."
            : "Microphone could not be started. Check browser or device settings.";

      return { ok: false, message };
    }
  };

  const sendVoiceToBackend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("payload", JSON.stringify(getPayload()));

      const res = await fetch(apiUrl("/assist/voice"), {
        method: "POST",
        body: formData
      });

      const data: AssistResponse & { error?: string } = await res.json();

      if (!res.ok) throw new Error(data?.error || "Voice request failed");

      if (data.transcript) {
        setSpeechText(data.transcript);
        addLog(`Heard: ${data.transcript}`);
      }

      setResult(data);
      await playAudio(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not process voice";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const openProtectedRole = (role: "family" | "doctor") => {
    setCareMenuOpen(false);
    setSpeakerRole(role);
    setLoginId("");
    setLoginPassword("");
    window.setTimeout(() => {
      rolePanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 50);
  };

  const openPatientRole = () => {
    setCareMenuOpen(false);
    setSpeakerRole("patient");
    setLoginId("");
    setLoginPassword("");
    window.setTimeout(() => {
      rolePanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 50);
  };

  return (
    <main className={currentTheme.page}>
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="fixed left-4 top-4 z-50">
          <button
            onClick={() => setCareMenuOpen((open) => !open)}
            className={currentTheme.menuButton}
            aria-expanded={careMenuOpen}
            aria-haspopup="menu"
            aria-label="Open care team menu"
            title="Care team menu"
          >
            <span aria-hidden="true" className={currentTheme.menuIcon}>
              <span />
              <span />
              <span />
            </span>
          </button>

          {careMenuOpen && (
            <button
              aria-label="Close care team menu"
              className={currentTheme.menuBackdrop}
              onClick={() => setCareMenuOpen(false)}
            />
          )}

          {careMenuOpen && (
            <div className={currentTheme.menuPanel} role="menu">
              <div className={currentTheme.menuHeader}>
                <p className="text-xs font-black uppercase tracking-[0.14em] opacity-60">
                  Menu
                </p>
                <p className="mt-1 text-lg font-black">yourOwn</p>
              </div>
              <button
                onClick={openPatientRole}
                className={currentTheme.menuItem}
                role="menuitem"
              >
                Patient dashboard
              </button>
              <button
                onClick={() => openProtectedRole("family")}
                className={currentTheme.menuItem}
                role="menuitem"
              >
                Family dashboard
              </button>
              <button
                onClick={() => openProtectedRole("doctor")}
                className={currentTheme.menuItem}
                role="menuitem"
              >
                {doctorUnlocked ? "Doctor dashboard" : "Doctor login"}
              </button>
            </div>
          )}
        </div>

        <header
          className={
            viewMode === "mobile"
              ? currentTheme.mobileHeroCard
              : currentTheme.heroCard
          }
        >
          <div
            className={
              viewMode === "mobile"
                ? "flex flex-col gap-4"
                : "flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
            }
          >
            <div>
              <div className={currentTheme.logoMark}>✨ yourOwn</div>
              <p
                className={
                  viewMode === "mobile"
                    ? currentTheme.mobileKicker
                    : currentTheme.kicker
                }
              >
                {viewMode === "mobile"
                  ? "Patient demo"
                  : "Silent disorientation demo"}
              </p>
              <h1
                className={
                  viewMode === "mobile"
                    ? currentTheme.mobileHeroTitle
                    : currentTheme.heroTitle
                }
              >
                {viewMode === "mobile"
                  ? "Detect silent disorientation, restore reality, escalate safely."
                  : "Detect silent disorientation, restore reality, escalate safely."}
              </h1>
              <p
                className={
                  viewMode === "mobile"
                    ? currentTheme.mobileSubText
                    : currentTheme.subText
                }
              >
                {viewMode === "mobile"
                  ? "Mary pauses while making tea. yourOwn checks in and alerts family if she cannot respond."
                  : "Powered by Gemma 4. Voice, vision, and care reasoning — with full local Ollama mode for complete privacy."}
              </p>
              <div
                className={
                  viewMode === "mobile"
                    ? "mt-4 grid gap-2"
                    : "mt-5 flex flex-wrap gap-3"
                }
              >
                <StatusPill
                  label="🧠 Gemma"
                  value={
                    gemmaStatus?.local_inference
                      ? `${gemmaStatus.model} local`
                      : gemmaStatus?.api_ready
                      ? `${gemmaStatus.api_model} API`
                      : "gemma-4-26b-a4b-it"
                  }
                  tone="low"
                />
                <StatusPill
                  label="🔒 Privacy"
                  value="Ollama local-first"
                  tone="low"
                />
                <StatusPill
                  label="🛡️ Safety"
                  value="grounded care reasoning"
                  tone="low"
                />
              </div>
            </div>

            <div
              className={
                viewMode === "mobile"
                  ? "grid gap-3"
                  : "flex flex-wrap justify-end gap-3"
              }
            >
              <div
                className={
                  viewMode === "mobile"
                    ? "grid grid-cols-[auto_1fr] gap-3"
                    : "flex flex-wrap justify-end gap-3"
                }
              >
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className={currentTheme.themeButton}
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                <span className="text-lg font-black leading-none">
                  {theme === "light" ? "🌙" : "☀️"}
                </span>
              </button>
              <button
                onClick={() =>
                  setViewMode(viewMode === "laptop" ? "mobile" : "laptop")
                }
                className={currentTheme.viewButton}
                aria-label="Toggle laptop and mobile mode"
                title="Toggle laptop and mobile mode"
              >
                {viewMode === "laptop" ? "📱 Mobile" : "💻 Laptop"}
              </button>
            </div>
          </div>
          </div>
        </header>

        {viewMode === "mobile" && isPatientRole && (
          <MobilePatientMode
            currentClock={currentClock}
            currentTheme={currentTheme}
            error={error}
            gpsStatus={gpsStatus}
            handleAssist={handleAssist}
            handleAiPhotoExplain={handleAiPhotoExplain}
            aiPhotoInputRef={aiPhotoInputRef}
            handleQuickPrompt={handleQuickPrompt}
            loading={loading}
            liveMonitoring={liveMonitoring}
            liveMonitoringStatus={liveMonitoringStatus}
            recording={recording}
            result={result}
            setSpeechText={setSpeechText}
            speechText={speechText}
            startRecording={startRecording}
            stopRecording={stopRecording}
            timeOfDay={timeOfDay}
            toggleLiveMonitoring={toggleLiveMonitoring}
          />
        )}

        {viewMode === "laptop" && isPatientRole && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className={currentTheme.demoPanel}>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6D8B7A]">
              Daily support
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] md:text-3xl">
              Calm help when the moment feels confusing.
            </h2>
            <p className="mt-3 text-sm font-bold leading-7 text-[#68766D]">
              Use voice, location, schedule, trusted family notes, and medicine
              context to give Mary simple reassurance and safe next steps.
            </p>
          </div>
          <div className={currentTheme.demoPanel}>
            <button
              onClick={() => handleQuickPrompt("I am scared. Where am I?")}
              disabled={loading || recording}
              className={currentTheme.demoButton}
            >
              {loading ? "Thinking..." : "I need help"}
            </button>
            <p className="mt-3 text-sm font-bold leading-6 text-[#68766D]">
              Patient-facing quick actions stay calm and practical.
            </p>
          </div>
        </section>
        )}

        {isProtectedRoleLocked && (
          <section ref={rolePanelRef} className="mx-auto mt-6 max-w-md">
            <Card theme={currentTheme}>
              <SectionTitle
                emoji={getRoleEmoji(speakerRole)}
                title={`${speakerRole} login`}
                description="Sign in to open the protected dashboard."
                theme={currentTheme}
              />

              <div className="mt-4 grid gap-3">
                <input
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="ID"
                  className={currentTheme.input}
                />
                <input
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  type="password"
                  className={currentTheme.input}
                />
                <button onClick={unlockRole} className={currentTheme.softButton}>
                  Unlock {speakerRole}
                </button>
                <p className={currentTheme.miniText}>
                  Care team login: family / 1234 or doctor / 1234
                </p>
              </div>
            </Card>
          </section>
        )}

        {!isProtectedRoleLocked && (
        <div
          className={
            isDoctorDashboard
              ? "mt-6 grid gap-6"
              : viewMode === "mobile"
              ? "mx-auto mt-6 grid max-w-md gap-6"
              : "mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
          }
        >
          {(isPatientRole || isFamilyDashboard) && (
          <section className="space-y-5">

            {viewMode === "laptop" && isPatientRole && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="🎙️"
                title="Live voice"
                description="Speak naturally. It listens, reasons, and speaks back."
                theme={currentTheme}
              />

                <div className="mt-5 flex flex-wrap gap-3 items-center">
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={loading || isProtectedRoleLocked}
                    className={recording ? currentTheme.dangerButton : currentTheme.voiceButton}
                  >
                    {recording ? "⏹ Stop" : "🎤 Speak"}
                  </button>
                </div>

                <button
                  onClick={toggleLiveMonitoring}
                  disabled={isProtectedRoleLocked}
                  className={
                    liveMonitoring
                      ? currentTheme.monitorButton
                      : currentTheme.monitorButton
                  }
                >
                  {liveMonitoring ? "Stop live monitor" : "Start live monitor"}
                </button>

                <div className={currentTheme.chatBox}>
                <textarea
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  placeholder="Type a message or speak to fill this text..."
                  className={`${currentTheme.input} min-h-[96px] resize-none pr-24`}
                />
                <button
                  onClick={handleAssist}
                  disabled={loading || recording || isProtectedRoleLocked}
                  className={
                    loading ? currentTheme.chatSendActive : currentTheme.chatSendButton
                  }
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>

                <StatusBox theme={currentTheme}>
                  {recording ? "Listening now..." : liveMonitoringStatus}
                </StatusBox>
              </Card>
            )}

            {isPatientRole && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="📷"
                title="Multimodal scene"
                description="Add what the camera or medicine photo shows."
                theme={currentTheme}
              />

              <div className="mt-5 grid gap-4">
                <div className={currentTheme.cameraBox}>
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="h-52 w-full rounded-2xl bg-black object-cover"
                  />

                  {capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Captured camera frame"
                      className="mt-3 h-32 w-full rounded-2xl object-cover"
                    />
                  )}

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <button
                      onClick={startCamera}
                      disabled={cameraActive}
                      className={
                        activeCameraButton === "start"
                          ? currentTheme.selectedButton
                          : currentTheme.softButton
                      }
                    >
                      Start camera
                    </button>
                    <button
                      onClick={captureCameraFrame}
                      disabled={!cameraActive}
                      className={
                        activeCameraButton === "capture"
                          ? currentTheme.selectedButton
                          : currentTheme.softButton
                      }
                    >
                      Capture
                    </button>
                    <button
                      onClick={stopCamera}
                      disabled={!cameraActive}
                      className={
                        activeCameraButton === "stop"
                          ? currentTheme.selectedButton
                          : currentTheme.softButton
                      }
                    >
                      Stop
                    </button>
                  </div>

                  <p className={currentTheme.miniText}>{cameraStatus}</p>
                </div>

                <Field label="Visual description" theme={currentTheme}>
                  <textarea
                    value={visualDescription}
                    onChange={(e) => setVisualDescription(e.target.value)}
                    readOnly={!canModifyCareInfo}
                    className={`${currentTheme.input} min-h-[86px] resize-none`}
                  />
                </Field>

                <Field label="Detected labels" theme={currentTheme}>
                  <input
                    value={imageLabels}
                    onChange={(e) => setImageLabels(e.target.value)}
                    readOnly={!canModifyCareInfo}
                    className={currentTheme.input}
                  />
                </Field>

                <Field label="Visual concern" theme={currentTheme}>
                  <select
                    value={visualConcern}
                    onChange={(e) => setVisualConcern(e.target.value)}
                    className={currentTheme.input}
                  >
                    <option value="">Context only</option>
                    <option value="medicine_check">Medicine check</option>
                    <option value="unsafe_scene">Unsafe scene</option>
                    <option value="identity_or_place">Identity or place help</option>
                  </select>
                </Field>
              </div>

              <StatusBox theme={currentTheme}>
                Camera labels feed Gemma evidence and safety risk.
              </StatusBox>
            </Card>
            )}

            {(isPatientRole || isFamilyDashboard) && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="📍"
                title="Live location"
                description="Use GPS once or keep it live while testing."
                theme={currentTheme}
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={getCurrentLocation}
                  className={
                    activeGpsButton === "get"
                      ? currentTheme.selectedButton
                      : currentTheme.softButton
                  }
                >
                  📍 Get GPS
                </button>
                <button
                  onClick={toggleGpsWatch}
                  className={
                    activeGpsButton === "live"
                      ? currentTheme.selectedButton
                      : currentTheme.softButton
                  }
                >
                  {gpsWatching ? "Stop live GPS" : "Start live GPS"}
                </button>
              </div>

              <StatusBox theme={currentTheme}>{gpsStatus}</StatusBox>
            </Card>
            )}

            {(isPatientRole || isFamilyDashboard) && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="🕒"
                title="Live schedule"
                description="The assistant uses time and next routine automatically."
                theme={currentTheme}
              />

              <div className={currentTheme.liveBox}>
                <p className="text-3xl font-black">{currentClock}</p>
                <p className="mt-2 font-bold capitalize">{timeOfDay}</p>
                <p className="mt-3 text-sm">
                  Now: {routineStatus}
                </p>
                <p className="mt-1 text-sm">
                  {activeCareRoutine
                    ? `Care moment: ${activeCareRoutine.time} - ${activeCareRoutine.label}`
                    : "No meal or medication reminder right now"}
                </p>
              </div>

              {activeReminder && (
                <div className={currentTheme.alarmBox}>
                  <p className="text-xs font-black uppercase tracking-[0.16em]">
                    Reminder ringing
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {activeReminder.label}
                  </p>
                  <button
                    onClick={() => setActiveReminder(null)}
                    className={currentTheme.alarmDismissButton}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={enableCareAlarms}
                  className={
                    alarmEnabled
                      ? currentTheme.selectedButton
                      : currentTheme.softButton
                  }
                >
                  {alarmEnabled ? "Alarms enabled" : "Enable alarms"}
                </button>
                <div className={currentTheme.statusBox}>
                  Next alarm: {nextAlarmReminder.time} - {nextAlarmReminder.label}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {careSchedule
                  .filter((item) => item.alarm)
                  .map((item) => {
                    const index = careSchedule.indexOf(item);
                    return (
                      <div key={`${item.kind}-${index}`} className={currentTheme.scheduleRow}>
                        <input
                          value={item.time}
                          onChange={(event) =>
                            updateScheduleItem(index, "time", event.target.value)
                          }
                          readOnly={!canModifySchedule}
                          className={currentTheme.scheduleTimeInput}
                        />
                        <input
                          value={item.label}
                          onChange={(event) =>
                            updateScheduleItem(index, "label", event.target.value)
                          }
                          readOnly={!canModifySchedule}
                          className={currentTheme.scheduleLabelInput}
                        />
                      </div>
                    );
                  })}
              </div>

              {canModifySchedule && (
                <div className="mt-5">
                  <button onClick={saveCareInfo} className={currentTheme.saveButton}>
                    {saveButtonState === "saved" ? "Saved" : "Save reminder times"}
                  </button>
                  {saveStatus && <p className={currentTheme.miniText}>{saveStatus}</p>}
                </div>
              )}
            </Card>
            )}

            {(isPatientRole || isFamilyDashboard) && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="📓"
                title="Today timeline"
                description="A lightweight live memory trail for the day."
                theme={currentTheme}
              />

              <div className="mt-4 space-y-2">
                {dailyLog.length === 0 && (
                  <p className={currentTheme.miniText}>
                    No moments logged yet.
                  </p>
                )}

                {dailyLog.map((item, index) => (
                  <p key={index} className={currentTheme.timelineItem}>
                    {item}
                  </p>
                ))}
              </div>
            </Card>
            )}

            {isPatientRole && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="Note"
                title="My notes"
                description="Save something you want to remember and read it later."
                theme={currentTheme}
              />

              <Field label="New note" theme={currentTheme}>
                <textarea
                  value={patientNoteDraft}
                  onChange={(event) => setPatientNoteDraft(event.target.value)}
                  className={`${currentTheme.input} min-h-[96px] resize-none`}
                  placeholder="Write something you want to remember..."
                />
              </Field>

              <button onClick={savePatientNote} className={currentTheme.saveButton}>
                {patientNoteSaveState === "saved" ? "Saved" : "Save note"}
              </button>

              <div className="mt-4 space-y-2">
                {patientNotes.length === 0 && (
                  <p className={currentTheme.miniText}>No saved notes yet.</p>
                )}

                {patientNotes.map((note) => (
                  <div key={note.id} className={currentTheme.timelineItem}>
                    <p>{note.text}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {new Date(note.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
            )}
          </section>
          )}

          <section className="space-y-5">
            {viewMode === "laptop" && isPatientRole && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="💬"
                title={result?.response_type === "conversation" ? "Companion conversation" : "Care response"}
                description="yourOwn is listening and responding."
                theme={currentTheme}
              />

              {!result && !error && (
                <EmptyState
                  recording={recording}
                  loading={loading}
                  gpsStatus={gpsStatus}
                  theme={currentTheme}
                />
              )}

              {error && <div className={currentTheme.errorBox}>{error}</div>}
              {result && <ResultPanel result={result} theme={currentTheme} />}
            </Card>
            )}

            {isDoctorDashboard && (
              <DoctorDashboard
                clinicalAssessment={clinicalAssessment}
                currentTheme={currentTheme}
                doctorNote={doctorNote}
                followUpPlan={followUpPlan}
                medicationPlan={medicationPlan}
                medicines={medicines}
                onSave={saveCareInfo}
                onMedicinesChange={setMedicines}
                result={result}
                saveButtonState={saveButtonState}
                saveStatus={saveStatus}
                severityTrend={severityTrend}
                setClinicalAssessment={setClinicalAssessment}
                setDoctorNote={setDoctorNote}
                setFollowUpPlan={setFollowUpPlan}
                setMedicationPlan={setMedicationPlan}
              />
            )}

            {isFamilyDashboard && (
              <PeopleMemoryDashboard
                currentTheme={currentTheme}
                people={people}
                loading={peopleLoading}
                userName={userName}
                onAdd={handleAddPersonToSupabase}
                onDelete={handleDeletePerson}
              />
            )}

            {isFamilyDashboard && (
              <FamilyPhotoDashboard
                currentTheme={currentTheme}
                onPhotoUpload={handlePhotoUpload}
                onRemovePhoto={removePhotoMemory}
                onSave={saveCareInfo}
                onUpdatePhoto={updatePhotoMemory}
                photoMemories={photoMemories}
                saveButtonState={saveButtonState}
                saveStatus={saveStatus}
              />
            )}

            {isFamilyDashboard && (
              <FamilyAlertSetup
                alerts={familyAlerts}
                careSettings={careSettings}
                currentTheme={currentTheme}
                gpsStatus={gpsStatus}
                onGetGps={getCurrentLocation}
                onSave={saveCareSettings}
                onAddCaregiver={addCaregiverContact}
                onRemoveCaregiver={removeCaregiverContact}
                onUseCurrentGps={useCurrentGpsAsHome}
                onUpdateCaregiver={updateCaregiverSetting}
                onUpdateCaregiverNotify={updateCaregiverNotify}
                onUpdateHome={updateHomeSetting}
                saveButtonLabel={
                  settingsButtonState === "saving"
                    ? "Saving..."
                    : settingsButtonState === "saved"
                      ? "Saved"
                      : "Save alert setup"
                }
                settingsStatus={settingsStatus}
              />
            )}

            {isFamilyDashboard && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="🧠"
                title="Situation engine"
                description="This creates context from time, GPS, schedule, role, and recent memory."
                theme={currentTheme}
              />

              <InfoCard title="Auto-created context" theme={currentTheme}>
                <Bullet>{autoContext}</Bullet>
              </InfoCard>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Patient name" theme={currentTheme}>
                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    readOnly={!canModifyCareInfo}
                    className={currentTheme.input}
                  />
                </Field>

                <Field label="Main language" theme={currentTheme}>
                  <select
                    value={mainLanguage}
                    onChange={(e) => setMainLanguage(e.target.value)}
                    className={currentTheme.input}
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang}>{lang}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Spoken language" theme={currentTheme}>
                  <select
                    value={spokenLanguage}
                    onChange={(e) => setSpokenLanguage(e.target.value)}
                    className={currentTheme.input}
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang}>{lang}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Nearby person" theme={currentTheme}>
                  <input
                    value={nearbyPerson}
                    onChange={(e) => setNearbyPerson(e.target.value)}
                    readOnly={!canModifyCareInfo}
                    className={currentTheme.input}
                  />
                </Field>

                <Field label="Recent event" theme={currentTheme}>
                  <input
                    value={lastEvent}
                    onChange={(e) => setLastEvent(e.target.value)}
                    readOnly={!canModifyCareInfo}
                    className={currentTheme.input}
                  />
                </Field>

                {speakerRole === "family" && familyUnlocked && (
                  <Field label="Family care note" theme={currentTheme}>
                    <input
                      value={careNote}
                      onChange={(e) => setCareNote(e.target.value)}
                      className={currentTheme.input}
                    />
                  </Field>
                )}
              </div>

              {canModifyCareInfo && (
                <div className="mt-5">
                  <button onClick={saveCareInfo} className={currentTheme.saveButton}>
                    {saveButtonState === "saved" ? "Saved" : "Save changes"}
                  </button>
                  {saveStatus && <p className={currentTheme.miniText}>{saveStatus}</p>}
                </div>
              )}
            </Card>
            )}

          </section>
        </div>
        )}
      </div>
    </main>
  );
}

function Card({
  children,
  theme
}: {
  children: ReactNode;
  theme: typeof lightTheme;
}) {
  return <div className={theme.card}>{children}</div>;
}

function getRoleEmoji(role: RoleName) {
  if (role === "family") return "👨‍👩‍👧";
  if (role === "doctor") return "🩺";
  return "💛";
}

function blankCareContact(): CareContact {
  return {
    name: "",
    relationship: "caregiver",
    phone: "",
    email: "",
    language: "English",
    notes: "",
    notify: true
  };
}

function PeopleMemoryDashboard({
  currentTheme,
  people,
  loading,
  userName,
  onAdd,
  onDelete
}: {
  currentTheme: typeof lightTheme;
  people: PersonRecord[];
  loading: boolean;
  userName: string;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("patientName", userName);
    fd.append("name", name.trim());
    fd.append("relationship", relationship.trim());
    fd.append("notes", notes.trim());
    if (photoFile) fd.append("photo", photoFile);
    await onAdd(fd);
    setName(""); setRelationship(""); setNotes(""); setPhotoFile(null);
    setSaving(false);
  };

  return (
    <Card theme={currentTheme}>
      <SectionTitle
        emoji="👨‍👩‍👧"
        title="People memory"
        description="Add family members so the patient can ask 'Who is Anna?' and see their face."
        theme={currentTheme}
      />

      <div className="mt-4 grid gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name, e.g. Anna" className={currentTheme.input} />
        <input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Relationship, e.g. daughter" className={currentTheme.input} />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes, e.g. visits every Sunday, brings flowers" className={`${currentTheme.input} min-h-[72px] resize-none`} />
        <label className={currentTheme.uploadButton}>
          {photoFile ? `📷 ${photoFile.name}` : "📷 Upload photo"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
        </label>
        <button type="button" onClick={handleSubmit} disabled={saving || !name.trim()} className={currentTheme.saveButton}>
          {saving ? "Saving..." : "Save to memory"}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className={currentTheme.miniText}>Loading...</p>}
        {!loading && people.length === 0 && <p className={currentTheme.miniText}>No people saved yet. Add someone above.</p>}
        {people.map((person) => (
          <div key={person.id} className={`${currentTheme.photoMemoryCard} flex items-center gap-4`}>
            {person.photo_url ? (
              <img src={person.photo_url} alt={person.name} className="h-16 w-16 rounded-full object-cover border-2 border-[#4ECDC4] flex-shrink-0" />
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#4ECDC4] text-2xl">👤</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-black text-base">{person.name}</p>
              {person.relationship && <p className="text-sm font-semibold text-[#4ECDC4]">{person.relationship}</p>}
              {person.notes && <p className="text-xs opacity-70 truncate">{person.notes}</p>}
            </div>
            <button type="button" onClick={() => onDelete(person.id)} className={currentTheme.softButton}>Remove</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DoctorDashboard({
  clinicalAssessment,
  currentTheme,
  doctorNote,
  followUpPlan,
  medicationPlan,
  medicines,
  onSave,
  onMedicinesChange,
  result,
  saveButtonState,
  saveStatus,
  severityTrend,
  setClinicalAssessment,
  setDoctorNote,
  setFollowUpPlan,
  setMedicationPlan
}: {
  clinicalAssessment: string;
  currentTheme: typeof lightTheme;
  doctorNote: string;
  followUpPlan: string;
  medicationPlan: string;
  medicines: MedicineEntry[];
  onSave: () => void;
  onMedicinesChange: Dispatch<SetStateAction<MedicineEntry[]>>;
  result: AssistResponse | null;
  saveButtonState: "idle" | "saved";
  saveStatus: string;
  severityTrend: SeverityTrend | null;
  setClinicalAssessment: Dispatch<SetStateAction<string>>;
  setDoctorNote: Dispatch<SetStateAction<string>>;
  setFollowUpPlan: Dispatch<SetStateAction<string>>;
  setMedicationPlan: Dispatch<SetStateAction<string>>;
}) {
  const risk = result?.care_reasoning?.risk.level ?? "pending";
  const safePlace =
    result?.care_reasoning?.action_plan.safe_place_status ?? "not evaluated";
  const grounding =
    result?.care_reasoning?.verification.grounding_score ?? "waiting";
  const doctorAction =
    result?.care_reasoning?.action_plan.doctor_action ??
    "Run an assessment to populate Gemma's clinical recommendation.";

  return (
    <Card theme={currentTheme}>
      <SectionTitle
        emoji="🩺"
        title="Doctor dashboard"
        description="Clinical entry, safety review, medication plan, and follow-up guidance."
        theme={currentTheme}
      />

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <SignalPill
          label="Risk"
          value={risk}
          tone="green"
        />
        <SignalPill label="Safe place" value={safePlace} tone="green" />
        <SignalPill label="Grounding" value={String(grounding)} tone="green" />
      </div>

      <InfoCard title="Clinical recommendation" theme={currentTheme}>
        <Bullet>{doctorAction}</Bullet>
      </InfoCard>

      <InfoCard title="Severity over time" theme={currentTheme}>
        <Bullet>
          Trend: {severityTrend?.trend?.replaceAll("_", " ") || "collecting baseline"}
        </Bullet>
        <Bullet>
          Recent average: {severityTrend ? Math.round(severityTrend.recentAverage * 100) : 0}%
          {" "}vs previous: {severityTrend ? Math.round(severityTrend.previousAverage * 100) : 0}%
        </Bullet>
        <Bullet>
          Samples: {severityTrend?.samples || 0}; recent high-risk moments:{" "}
          {severityTrend?.highRiskRecent || 0}
        </Bullet>
        <Bullet>
          Silent confusion: {severityTrend?.silentConfusionRecent || 0} recent vs{" "}
          {severityTrend?.silentConfusionPrevious || 0} previous
        </Bullet>
        <Bullet>
          Main signals:{" "}
          {severityTrend?.topRiskDrivers?.length
            ? severityTrend.topRiskDrivers
                .map((item) => `${item.flag.replaceAll("_", " ")} (${item.count})`)
                .join(", ")
            : "collecting baseline"}
        </Bullet>
        {severityTrend?.doctorSummary ? <Bullet>{severityTrend.doctorSummary}</Bullet> : null}
      </InfoCard>

      <div className="mt-5 grid gap-4">
        <Field label="Clinical assessment" theme={currentTheme}>
          <textarea
            value={clinicalAssessment}
            onChange={(e) => setClinicalAssessment(e.target.value)}
            className={`${currentTheme.input} min-h-[92px] resize-none`}
          />
        </Field>

        <div className="col-span-full">
          <p className="mb-2 text-xs font-black uppercase tracking-widest opacity-60">💊 Medicine List</p>
          <div className="space-y-3">
            {medicines.map((med) => (
              <div key={med.id} className={`${currentTheme.photoMemoryCard} grid gap-2`}>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={med.name}
                    onChange={(e) => onMedicinesChange((prev) => prev.map((m) => m.id === med.id ? { ...m, name: e.target.value } : m))}
                    placeholder="Medicine name"
                    className={currentTheme.input}
                  />
                  <input
                    value={med.dosage}
                    onChange={(e) => onMedicinesChange((prev) => prev.map((m) => m.id === med.id ? { ...m, dosage: e.target.value } : m))}
                    placeholder="Dosage, e.g. 10mg"
                    className={currentTheme.input}
                  />
                  <input
                    value={med.schedule}
                    onChange={(e) => onMedicinesChange((prev) => prev.map((m) => m.id === med.id ? { ...m, schedule: e.target.value } : m))}
                    placeholder="When, e.g. morning with food"
                    className={currentTheme.input}
                  />
                  <input
                    value={med.appearance}
                    onChange={(e) => onMedicinesChange((prev) => prev.map((m) => m.id === med.id ? { ...m, appearance: e.target.value } : m))}
                    placeholder="Appearance, e.g. small white round pill"
                    className={currentTheme.input}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onMedicinesChange((prev) => prev.filter((m) => m.id !== med.id))}
                  className={currentTheme.softButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onMedicinesChange((prev) => [...prev, { id: crypto.randomUUID(), name: "", dosage: "", schedule: "", appearance: "" }])}
              className={currentTheme.softButton}
            >
              + Add medicine
            </button>
          </div>
        </div>

        <Field label="Medication / care plan (auto-generated)" theme={currentTheme}>
          <textarea
            value={medicines.length > 0
              ? medicines.filter(m => m.name).map(m => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.schedule ? ` — ${m.schedule}` : ""}${m.appearance ? ` (${m.appearance})` : ""}`).join("\n")
              : medicationPlan}
            onChange={(e) => setMedicationPlan(e.target.value)}
            readOnly={medicines.length > 0}
            className={`${currentTheme.input} min-h-[92px] resize-none`}
          />
        </Field>

        <Field label="Follow-up plan" theme={currentTheme}>
          <textarea
            value={followUpPlan}
            onChange={(e) => setFollowUpPlan(e.target.value)}
            className={`${currentTheme.input} min-h-[92px] resize-none`}
          />
        </Field>

        <Field label="Patient-facing doctor instruction" theme={currentTheme}>
          <textarea
            value={doctorNote}
            onChange={(e) => setDoctorNote(e.target.value)}
            className={`${currentTheme.input} min-h-[92px] resize-none`}
          />
        </Field>
      </div>

      <button onClick={onSave} className={currentTheme.saveButton}>
        {saveButtonState === "saved" ? "Saved" : "Save doctor updates"}
      </button>
      {saveStatus && <p className={currentTheme.miniText}>{saveStatus}</p>}
    </Card>
  );
}

function FamilyPhotoDashboard({
  currentTheme,
  onPhotoUpload,
  onRemovePhoto,
  onSave,
  onUpdatePhoto,
  photoMemories,
  saveButtonState,
  saveStatus
}: {
  currentTheme: typeof lightTheme;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (id: string) => void;
  onSave: () => void;
  onUpdatePhoto: (
    id: string,
    field: "name" | "relationship" | "description",
    value: string
  ) => void;
  photoMemories: PhotoMemory[];
  saveButtonState: "idle" | "saved";
  saveStatus: string;
}) {
  return (
    <Card theme={currentTheme}>
      <SectionTitle
        emoji="📷"
        title="Family picture memory"
        description="Upload patient and family photos so the companion can help with recognition."
        theme={currentTheme}
      />

      <label className={currentTheme.uploadButton}>
        Upload pictures
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onPhotoUpload}
          className="hidden"
        />
      </label>

      <div className="mt-5 grid gap-4">
        {photoMemories.length === 0 && (
          <p className={currentTheme.miniText}>
            Add photos of the patient, family members, and trusted caregivers.
          </p>
        )}

        {photoMemories.map((photo) => (
          <div key={photo.id} className={currentTheme.photoMemoryCard}>
            <img
              src={photo.imageDataUrl}
              alt={photo.name || "Family memory"}
              className="h-32 w-full rounded-xl object-cover"
            />
            <div className="mt-3 grid gap-3">
              <input
                value={photo.name}
                onChange={(event) =>
                  onUpdatePhoto(photo.id, "name", event.target.value)
                }
                placeholder="Name, e.g. Anna"
                className={currentTheme.input}
              />
              <input
                value={photo.relationship}
                onChange={(event) =>
                  onUpdatePhoto(photo.id, "relationship", event.target.value)
                }
                placeholder="Relationship, e.g. daughter"
                className={currentTheme.input}
              />
              <textarea
                value={photo.description}
                onChange={(event) =>
                  onUpdatePhoto(photo.id, "description", event.target.value)
                }
                placeholder="Description, e.g. visits every evening and wears blue glasses"
                className={`${currentTheme.input} min-h-[76px] resize-none`}
              />
              <div className={currentTheme.nextStepBox}>
                <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
                  Summary
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {[photo.name || "Unknown person", photo.relationship, photo.description]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              </div>
              <button
                onClick={() => onRemovePhoto(photo.id)}
                className={currentTheme.softButton}
              >
                Remove picture
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onSave} className={currentTheme.saveButton}>
        {saveButtonState === "saved" ? "Saved" : "Save family updates"}
      </button>
      {saveStatus && <p className={currentTheme.miniText}>{saveStatus}</p>}
    </Card>
  );
}

function FamilyAlertSetup({
  alerts,
  careSettings,
  currentTheme,
  gpsStatus,
  onGetGps,
  onSave,
  onAddCaregiver,
  onRemoveCaregiver,
  onUseCurrentGps,
  onUpdateCaregiver,
  onUpdateCaregiverNotify,
  onUpdateHome,
  saveButtonLabel,
  settingsStatus
}: {
  alerts: FamilyAlert[];
  careSettings: CareSettings | null;
  currentTheme: typeof lightTheme;
  gpsStatus: string;
  onGetGps: () => void;
  onSave: () => void;
  onAddCaregiver: () => void;
  onRemoveCaregiver: (index: number) => void;
  onUseCurrentGps: () => void;
  onUpdateCaregiver: (
    index: number,
    field: "name" | "relationship" | "phone" | "email" | "notes",
    value: string
  ) => void;
  onUpdateCaregiverNotify: (index: number, notify: boolean) => void;
  onUpdateHome: (
    field: "lat" | "lng" | "radiusMeters" | "address",
    value: string
  ) => void;
  saveButtonLabel: string;
  settingsStatus: string;
}) {
  const home = careSettings?.home || {
    lat: 0,
    lng: 0,
    radiusMeters: 120,
    address: ""
  };
  const contacts = careSettings?.contacts?.length
    ? careSettings.contacts
    : [blankCareContact()];

  return (
    <Card theme={currentTheme}>
      <SectionTitle
        emoji="!"
        title="Family alerts"
        description="Family can set home GPS, safe distance, and who receives away-from-home distress alerts."
        theme={currentTheme}
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Home latitude" theme={currentTheme}>
          <input
            value={home.lat}
            onChange={(event) => onUpdateHome("lat", event.target.value)}
            className={currentTheme.input}
          />
        </Field>
        <Field label="Home longitude" theme={currentTheme}>
          <input
            value={home.lng}
            onChange={(event) => onUpdateHome("lng", event.target.value)}
            className={currentTheme.input}
          />
        </Field>
        <Field label="Home radius meters" theme={currentTheme}>
          <input
            value={home.radiusMeters}
            onChange={(event) =>
              onUpdateHome("radiusMeters", event.target.value)
            }
            className={currentTheme.input}
          />
        </Field>
        <Field label="Home address note" theme={currentTheme}>
          <input
            value={home.address || ""}
            onChange={(event) => onUpdateHome("address", event.target.value)}
            className={currentTheme.input}
          />
        </Field>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className={currentTheme.label}>Notification contacts</p>
          <button onClick={onAddCaregiver} className={currentTheme.softButton}>
            Add contact
          </button>
        </div>

        {contacts.map((contact, index) => (
          <div key={index} className={currentTheme.photoMemoryCard}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black">Contact {index + 1}</p>
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
                <input
                  type="checkbox"
                  checked={contact.notify !== false}
                  onChange={(event) =>
                    onUpdateCaregiverNotify(index, event.target.checked)
                  }
                />
                Notify
              </label>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                value={contact.name}
                onChange={(event) =>
                  onUpdateCaregiver(index, "name", event.target.value)
                }
                placeholder="Name"
                className={currentTheme.input}
              />
              <input
                value={contact.relationship}
                onChange={(event) =>
                  onUpdateCaregiver(index, "relationship", event.target.value)
                }
                placeholder="Relationship"
                className={currentTheme.input}
              />
              <input
                value={contact.phone}
                onChange={(event) =>
                  onUpdateCaregiver(index, "phone", event.target.value)
                }
                placeholder="+15551234567"
                className={currentTheme.input}
              />
              <input
                value={contact.email}
                onChange={(event) =>
                  onUpdateCaregiver(index, "email", event.target.value)
                }
                placeholder="Email"
                className={currentTheme.input}
              />
            </div>
            <textarea
              value={contact.notes || ""}
              onChange={(event) =>
                onUpdateCaregiver(index, "notes", event.target.value)
              }
              placeholder="Availability or care note"
              className={`${currentTheme.input} mt-3 min-h-[70px] resize-none`}
            />
            {contacts.length > 1 && (
              <button
                onClick={() => onRemoveCaregiver(index)}
                className={currentTheme.softButton}
              >
                Remove contact
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <button onClick={onGetGps} className={currentTheme.primaryButton}>
          Get GPS
        </button>
        <button onClick={onUseCurrentGps} className={currentTheme.primaryButton}>
          Use GPS as home
        </button>
        <button onClick={onSave} className={currentTheme.saveButton}>
          {saveButtonLabel}
        </button>
      </div>
      <p className={currentTheme.statusBox}>{gpsStatus}</p>
      {settingsStatus && <p className={currentTheme.miniText}>{settingsStatus}</p>}

      <InfoCard title="Recent family alerts" theme={currentTheme}>
        {alerts.length === 0 && <Bullet>No family alerts yet.</Bullet>}
        {alerts.slice(0, 5).map((alert) => (
          <Bullet key={alert.id}>
            {new Date(alert.timestamp).toLocaleString()}: {alert.message}
          </Bullet>
        ))}
      </InfoCard>
    </Card>
  );
}

function MobilePatientMode({
  currentClock,
  currentTheme,
  error,
  gpsStatus,
  handleAssist,
  handleAiPhotoExplain,
  aiPhotoInputRef,
  handleQuickPrompt,
  loading,
  liveMonitoring,
  liveMonitoringStatus,
  recording,
  result,
  setSpeechText,
  speechText,
  startRecording,
  stopRecording,
  timeOfDay,
  toggleLiveMonitoring
}: {
  currentClock: string;
  currentTheme: typeof lightTheme;
  error: string;
  gpsStatus: string;
  handleAssist: () => Promise<void>;
  handleAiPhotoExplain: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  aiPhotoInputRef: React.RefObject<HTMLInputElement | null>;
  handleQuickPrompt: (
    prompt: string,
    visualOverrides?: {
      description?: string;
      labels?: string;
      concern?: string;
    }
  ) => Promise<void>;
  loading: boolean;
  liveMonitoring: boolean;
  liveMonitoringStatus: string;
  recording: boolean;
  result: AssistResponse | null;
  setSpeechText: Dispatch<SetStateAction<string>>;
  speechText: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  timeOfDay: string;
  toggleLiveMonitoring: () => void;
}) {
  const [activePatientButton, setActivePatientButton] =
    useState<MobilePatientButtonName>("scared");

  return (
    <section className="mx-auto mt-6 max-w-md space-y-4">
      <div className={currentTheme.phoneShell}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
              Patient mode
            </p>
            <p className="mt-1 text-3xl font-black">{currentClock}</p>
            <p className="text-sm font-bold capitalize opacity-70">{timeOfDay}</p>
          </div>
          <div className={currentTheme.watchBubble}>⌚</div>
        </div>

        <div className="mt-6 grid gap-3">
          <button
            onClick={() => {
              setActivePatientButton("scared");
              handleQuickPrompt("I am scared. Where am I?");
            }}
            disabled={loading || recording}
            className={
              activePatientButton === "scared"
                ? currentTheme.mobileCrisisSelectedButton
                : currentTheme.mobileCrisisButton
            }
          >
            😟 I&apos;m scared
          </button>
          <button
            onClick={() => {
              setActivePatientButton("where");
              handleQuickPrompt("Where am I?");
            }}
            disabled={loading || recording}
            className={
              activePatientButton === "where"
                ? currentTheme.mobileActionSelectedButton
                : currentTheme.mobileActionButton
            }
          >
            📍 Where am I?
          </button>
          <button
            onClick={() => {
              setActivePatientButton("medicine");
              handleQuickPrompt("Is this my medicine?");
            }}
            disabled={loading || recording}
            className={
              activePatientButton === "medicine"
                ? currentTheme.mobileActionSelectedButton
                : currentTheme.mobileActionButton
            }
          >
            💊 Is this my medicine?
          </button>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              setActivePatientButton("speak");
              if (recording) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            disabled={loading}
            className={`flex-1 rounded-2xl py-3 text-sm font-black ${
              recording
                ? currentTheme.mobileStopButton
                : activePatientButton === "speak"
                  ? currentTheme.mobileVoiceSelectedButton
                  : currentTheme.mobileVoiceButton
            }`}
          >
            {recording ? "⏹ Stop" : "🎙️ Speak"}
          </button>

          <label htmlFor="ai-photo-upload-mobile" className="sr-only">Upload a photo for AI to describe</label>
          <input
            id="ai-photo-upload-mobile"
            type="file"
            accept="image/*"
            ref={aiPhotoInputRef}
            className="hidden"
            onChange={handleAiPhotoExplain}
            aria-label="Upload a photo for AI to describe"
          />
          <button
            type="button"
            onClick={() => aiPhotoInputRef.current?.click()}
            disabled={loading}
            className={`flex-1 rounded-2xl py-3 text-sm font-black ${currentTheme.mobileVoiceButton}`}
            title="Upload a photo — AI will describe what it sees"
          >
            📷 Photo
          </button>
        </div>

        <button
          onClick={toggleLiveMonitoring}
          disabled={loading}
          className={
            liveMonitoring
              ? currentTheme.mobileMonitorButton
              : currentTheme.mobileMonitorButton
          }
        >
          {liveMonitoring ? "Stop live monitor" : "Start live monitor"}
        </button>

        <div className={currentTheme.chatBox}>
          <textarea
            value={speechText}
            onChange={(event) => setSpeechText(event.target.value)}
            placeholder="Type a message or speak to fill this text..."
            className={`${currentTheme.input} min-h-[92px] resize-none pr-24`}
          />
          <button
            onClick={() => {
              setActivePatientButton("send");
              handleAssist();
            }}
            disabled={loading || recording}
            className={
              loading ? currentTheme.chatSendActive : currentTheme.chatSendButton
            }
          >
            {loading ? "..." : "Send"}
          </button>
        </div>

        <p className={currentTheme.mobileStatus}>{gpsStatus}</p>
        <p className={currentTheme.mobileStatus}>{liveMonitoringStatus}</p>
      </div>

      <div className={currentTheme.phoneShell}>
        <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
          Current request
        </p>
        <p className="mt-2 text-lg font-black">{speechText}</p>

        {error && <div className={currentTheme.errorBox}>{error}</div>}

        {!result && !error && (
          <div className="mt-5 rounded-3xl bg-[#FAF7F0] p-5 text-center text-sm font-black text-[#68766D]">
            {loading ? "Gemma is checking context..." : "Tap a button for help."}
          </div>
        )}

        {result && <ResultPanel result={result} theme={currentTheme} />}
      </div>
    </section>
  );
}


function SectionTitle({
  emoji,
  title,
  description,
  theme
}: {
  emoji: string;
  title: string;
  description: string;
  theme: typeof lightTheme;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className={theme.iconBox}>{emoji}</div>
        <h2 className={theme.sectionTitle}>{title}</h2>
      </div>
      <p className={theme.sectionDescription}>{description}</p>
    </div>
  );
}

function Field({
  label,
  children,
  theme
}: {
  label: string;
  children: ReactNode;
  theme: typeof lightTheme;
}) {
  return (
    <label className="block">
      <span className={theme.label}>{label}</span>
      {children}
    </label>
  );
}

function StatusBox({
  children,
  theme
}: {
  children: ReactNode;
  theme: typeof lightTheme;
}) {
  return <p className={theme.statusBox}>{children}</p>;
}

function EmptyState({
  recording,
  loading,
  gpsStatus,
  theme
}: {
  recording: boolean;
  loading: boolean;
  gpsStatus: string;
  theme: typeof lightTheme;
}) {
  return (
    <div className={theme.emptyState}>
      <div className="text-5xl font-black">
        {recording ? "🎙️" : loading ? "✨" : "💛"}
      </div>
      <p className={theme.emptyTitle}>
        {recording ? "Listening..." : loading ? "Thinking..." : "Waiting"}
      </p>
      <p className={theme.emptyText}>
        This response uses live time, GPS, schedule, language, role, and recent
        context.
      </p>
      <p className={theme.gpsPill}>{gpsStatus}</p>
    </div>
  );
}

function ResultPanel({
  result,
  theme,
  hideTranscript = false
}: {
  result: AssistResponse;
  theme: typeof lightTheme;
  hideTranscript?: boolean;
}) {
  return (
    <div className="mt-5 space-y-4">
      {!hideTranscript && result.transcript && (
        <InfoCard title="Transcript" theme={theme}>
          <Bullet>{result.transcript}</Bullet>
        </InfoCard>
      )}

      <div className={theme.responseBox}>
        <p className={theme.responseText}>
          {result.companion_message ||
            [result.response.reassurance, result.response.next_step]
              .filter(Boolean)
              .join(" ")}
        </p>
      </div>

      {result.person_result && (
        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          background: "linear-gradient(135deg, #e8f5e9, #e3f2fd)",
          borderRadius: "16px", padding: "16px", marginTop: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          {result.person_result.photo_url ? (
            <img
              src={result.person_result.photo_url}
              alt={result.person_result.name}
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #4ECDC4" }}
            />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#4ECDC4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
              👤
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: 20, color: "#333" }}>{result.person_result.name}</p>
            {result.person_result.relationship && (
              <p style={{ margin: "2px 0 0 0", fontSize: 14, color: "#4ECDC4", fontWeight: 600 }}>{result.person_result.relationship}</p>
            )}
            {result.person_result.notes && (
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666" }}>{result.person_result.notes}</p>
            )}
          </div>
        </div>
      )}

      {result.ollama_meta && (
        <div className="mt-3 flex items-center gap-2 text-xs opacity-70">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${result.ollama_meta.local ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
            {result.ollama_meta.local ? "🔒 Local" : "⚡ Fast"}
          </span>
          <span className="font-mono">Gemma 4</span>
          {result.ollama_meta.inference_ms > 0 && (
            <span>{result.ollama_meta.inference_ms}ms</span>
          )}
        </div>
      )}

      {result.care_reasoning && (
        <InfoCard
          title={
            result.response_type === "conversation"
              ? "Live risk monitor"
              : "Gemma 4 care reasoning"
          }
          theme={theme}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <SignalPill
              label="Risk"
              value={`${result.care_reasoning.risk.level.toUpperCase()} ${Math.round(
                result.care_reasoning.risk.score * 100
              )}%`}
              tone={result.care_reasoning.risk.level}
            />
            <SignalPill
              label="Grounding"
              value={
                result.care_reasoning.verification.safe_to_send
                  ? "Verified"
                  : "Needs review"
              }
              tone={
                result.care_reasoning.verification.safe_to_send
                  ? "low"
                  : "high"
              }
            />
            <SignalPill
              label="Safe place"
              value={result.care_reasoning.action_plan.safe_place_status}
              tone={
                result.care_reasoning.action_plan.safe_place_status ===
                "known_safe_place"
                  ? "low"
                  : "medium"
              }
            />
          </div>
          <div className="mt-4 space-y-2">
            {result.care_reasoning.risk.reasons.slice(0, 4).map((item, index) => (
              <Bullet key={index}>{item}</Bullet>
            ))}
          </div>
        </InfoCard>
      )}

      {result.care_reasoning && (
        <InfoCard title="Action plan" theme={theme}>
          <Bullet>Patient: {result.care_reasoning.action_plan.patient_action}</Bullet>
          <Bullet>
            Family: {result.care_reasoning.action_plan.caregiver_action}
          </Bullet>
          <Bullet>Doctor: {result.care_reasoning.action_plan.doctor_action}</Bullet>
          <Bullet>
            Alerts: family{" "}
            {result.care_reasoning.action_plan.alert_family ? "yes" : "no"},
            doctor{" "}
            {result.care_reasoning.action_plan.alert_doctor ? "yes" : "no"}
          </Bullet>
        </InfoCard>
      )}

      {result.family_alert?.sent && result.family_alert.alert && (
        <InfoCard title="Family notification" theme={theme}>
          <Bullet>{result.family_alert.alert.message}</Bullet>
          <Bullet>
            SMS:{" "}
            {result.family_alert.sms?.attempted
              ? result.family_alert.sms.success
                ? "sent"
                : "attempted"
              : "not configured"}
          </Bullet>
        </InfoCard>
      )}

      {result.care_reasoning && (
        <InfoCard title="Evidence used" theme={theme}>
          {result.care_reasoning.evidence.map((item, index) => (
            <Bullet key={index}>{item}</Bullet>
          ))}
        </InfoCard>
      )}

      {result.care_reasoning && (
        <InfoCard title="Tool/function trace" theme={theme}>
          {result.care_reasoning.tool_trace.map((trace, index) => (
            <Bullet key={index}>
              <span className="font-black">{trace.tool}</span>:{" "}
              {summarizeToolResult(trace.result)}
            </Bullet>
          ))}
        </InfoCard>
      )}

      <InfoCard title="Environment" theme={theme}>
        <Bullet>Likely place: {result.environment.likely_place}</Bullet>
        <Bullet>
          People:{" "}
          {result.environment.likely_people.length
            ? result.environment.likely_people.join(", ")
            : "No strong match"}
        </Bullet>
        <Bullet>Time: {result.environment.time_context}</Bullet>
        <Bullet>Routine: {result.environment.routine_hint}</Bullet>
      </InfoCard>

      <InfoCard title="Memory summary" theme={theme}>
        {result.memory_summary.map((item, index) => (
          <Bullet key={index}>{item}</Bullet>
        ))}
      </InfoCard>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: string;
}) {
  const toneClass =
    tone === "high"
      ? "border border-[#F2A7A7]/35 bg-[#6E3F4A]/55 text-[#FFE0E0] backdrop-blur-xl"
      : tone === "medium"
        ? "border border-[#D8C48A]/35 bg-[#5E5972]/55 text-[#F4E9C8] backdrop-blur-xl"
        : "border border-[#D8CFB2] bg-[#FFFBEA] text-black shadow-sm";

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <p className="mt-1 text-xs font-black">{value}</p>
    </div>
  );
}

function SignalPill({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: string;
}) {
  const toneClass =
    tone === "green"
      ? "border border-green-200 bg-green-100 text-green-900 shadow-sm"
      : tone === "emergency" || tone === "high"
      ? "border border-[#F2A7A7]/35 bg-[#6E3F4A]/55 text-[#FFE0E0] backdrop-blur-xl"
      : tone === "medium"
        ? "border border-[#D8C48A]/35 bg-[#5E5972]/55 text-[#F4E9C8] backdrop-blur-xl"
        : "border border-[#BFD2E8]/35 bg-[#6F86A3]/35 text-[#F3F7FF] backdrop-blur-xl";

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function summarizeToolResult(value: unknown) {
  if (value === null || value === undefined) return "no result";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    const text = JSON.stringify(value);
    return text.length > 180 ? `${text.slice(0, 180)}...` : text;
  } catch {
    return "structured result";
  }
}

function InfoCard({
  title,
  children,
  theme
}: {
  title: string;
  children: ReactNode;
  theme: typeof lightTheme;
}) {
  return (
    <div className={theme.infoCard}>
      <p className="mb-3 text-sm font-black tracking-wide">{title}</p>
      <div className="space-y-2 text-sm leading-7">{children}</div>
    </div>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-[2px] opacity-50">-</span>
      <span>{children}</span>
    </div>
  );
}

const lightTheme = {
  page: "relative min-h-screen bg-white px-4 py-6 font-['Times_New_Roman',Times,serif] text-black",
  heroCard:
    "rounded-[24px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70 md:p-7",
  mobileHeroCard:
    "mx-auto max-w-md rounded-[24px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70",
  demoPanel:
    "rounded-[20px] border border-slate-200 bg-white p-5 shadow-md shadow-slate-200/70",
  demoButton:
    "w-full rounded-2xl bg-blue-600 px-5 py-4 text-base font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  card: "rounded-[20px] border border-slate-200 bg-white p-5 text-black shadow-md shadow-slate-200/70",
  logoMark:
    "inline-flex rounded-full bg-purple-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700",
  kicker: "mt-5 text-xs font-black uppercase tracking-[0.14em] text-slate-600",
  mobileKicker:
    "mt-4 text-xs font-black uppercase tracking-[0.12em] text-slate-600",
  heroTitle:
    "mt-2 max-w-3xl text-3xl font-black leading-[1.05] text-black md:text-5xl",
  mobileHeroTitle:
    "mt-2 text-2xl font-black leading-tight text-black",
  subText: "mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-700 md:text-base",
  mobileSubText:
    "mt-3 text-sm font-semibold leading-6 text-slate-700",
  themeButton:
    "flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-sm transition hover:scale-105 active:bg-green-600",
  viewButton:
    "flex h-12 min-w-28 items-center justify-center rounded-full bg-gradient-to-r from-purple-300 to-pink-400 px-5 text-xs font-black text-black shadow-sm transition hover:scale-105 active:bg-none active:bg-blue-600 active:text-white",
  menuButton:
    "flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-black shadow-sm transition hover:scale-105 active:border-blue-600 active:bg-blue-600 active:text-white",
  menuIcon:
    "grid w-5 gap-1 [&>span]:block [&>span]:h-0.5 [&>span]:rounded-full [&>span]:bg-current",
  menuBackdrop:
    "fixed inset-0 z-30 cursor-default bg-black/10 backdrop-blur-[1px]",
  menuPanel:
    "fixed left-4 top-20 z-40 grid w-64 gap-1 rounded-[18px] border border-slate-200 bg-white p-3 text-black shadow-2xl shadow-slate-300/60",
  menuHeader:
    "mb-2 border-b border-slate-200 px-3 pb-3 pt-2",
  menuItem:
    "rounded-xl px-4 py-3 text-left text-sm font-black transition hover:bg-slate-50 active:bg-blue-600 active:text-white",
  phoneShell:
    "rounded-[24px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70",
  watchBubble:
    "flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-xl",
  mobileCrisisButton:
    "min-h-[70px] rounded-[20px] border border-slate-200 bg-white px-5 py-4 text-left text-xl font-black text-black shadow-sm transition hover:scale-[1.01] active:border-blue-600 active:bg-blue-600 active:text-white disabled:opacity-60",
  mobileCrisisSelectedButton:
    "min-h-[70px] rounded-[20px] bg-blue-600 px-5 py-4 text-left text-xl font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileActionButton:
    "min-h-[58px] rounded-[18px] border border-slate-200 bg-white px-5 py-3 text-left text-base font-black text-black shadow-sm transition hover:scale-[1.01] active:border-blue-600 active:bg-blue-600 active:text-white disabled:opacity-60",
  mobileActionSelectedButton:
    "min-h-[58px] rounded-[18px] bg-blue-600 px-5 py-3 text-left text-base font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileVoiceButton:
    "min-h-[58px] w-full rounded-[18px] bg-blue-600 px-5 py-3 text-center text-xl font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileVoiceSelectedButton:
    "min-h-[58px] w-full rounded-[18px] bg-blue-600 px-5 py-3 text-center text-xl font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileMonitorButton:
    "mt-3 min-h-[58px] w-full rounded-[18px] bg-green-600 px-5 py-3 text-center text-xl font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-green-700 disabled:opacity-60",
  selectedButton:
    "w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-blue-700 disabled:opacity-60",
  mobileStopButton:
    "min-h-[58px] w-full rounded-[18px] bg-blue-600 px-5 py-3 text-center text-xl font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileDemoButton:
    "mt-3 min-h-[58px] w-full rounded-[18px] border border-slate-200 bg-white px-5 py-3 text-center text-base font-black text-black shadow-sm transition hover:scale-[1.01] active:border-blue-600 active:bg-blue-600 active:text-white disabled:opacity-60",
  mobileStatus:
    "mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-center text-xs font-black text-slate-700",
  mobileResponseBox:
    "rounded-[20px] bg-slate-50 p-5 text-black",
  cameraBox:
    "rounded-[18px] border border-slate-200 bg-slate-50 p-3",
  chatBox:
    "relative mt-4",
  chatSendButton:
    "absolute bottom-3 right-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-sm transition active:bg-blue-700 disabled:opacity-60",
  chatSendActive:
    "absolute bottom-3 right-3 rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white shadow-sm disabled:opacity-60",
  primaryButton:
    "rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-black text-black shadow-sm transition hover:scale-[1.02] active:border-blue-600 active:bg-blue-600 active:text-white disabled:opacity-60",
  secondaryButton:
    "rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-black text-black shadow-sm transition hover:scale-[1.02] active:border-blue-600 active:bg-blue-600 active:text-white disabled:opacity-60",
  softButton:
    "mt-5 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-black shadow-sm transition hover:scale-[1.02] active:border-blue-600 active:bg-blue-600 active:text-white disabled:opacity-60",
  voiceButton:
    "mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-blue-700 disabled:opacity-60",
  monitorButton:
    "mt-5 w-full rounded-2xl bg-green-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-green-700 disabled:opacity-60",
  dangerButton:
    "rounded-2xl bg-blue-600 px-5 py-4 text-base font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-blue-700 disabled:opacity-60",
  input:
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-black outline-none placeholder:text-slate-400 focus:border-pink-400",
  iconBox:
    "flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-lg",
  sectionTitle: "text-xl font-black text-black",
  sectionDescription: "mt-2 text-sm font-semibold leading-6 text-slate-700",
  label:
    "mb-2 block text-xs font-black uppercase tracking-[0.1em] text-slate-600",
  statusBox:
    "mt-4 rounded-xl bg-slate-50 p-3 text-center text-xs font-black text-slate-700",
  segment: "mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-2",
  segmentActive:
    "rounded-xl bg-gradient-to-r from-purple-300 to-pink-400 px-3 py-3 text-sm font-black text-black shadow",
  segmentInactive:
    "rounded-xl px-3 py-3 text-sm font-black text-slate-700 hover:bg-white",
  liveBox: "mt-5 rounded-2xl bg-slate-50 p-5 text-black",
  alarmBox:
    "mt-4 rounded-2xl border border-green-200 bg-green-100 p-5 text-green-900 shadow-sm",
  alarmDismissButton:
    "mt-3 rounded-xl bg-green-600 px-4 py-2 text-sm font-black text-white transition active:bg-green-700",
  saveButton:
    "mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-blue-700",
  uploadButton:
    "mt-5 flex w-full cursor-pointer items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-blue-700",
  photoMemoryCard:
    "rounded-[18px] border border-slate-200 bg-slate-50 p-3 text-black",
  scheduleRow:
    "grid grid-cols-[92px_1fr] gap-3 rounded-xl border border-slate-200 bg-white p-3",
  scheduleTimeInput:
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-black outline-none focus:border-blue-500",
  scheduleLabelInput:
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-black outline-none focus:border-blue-500",
  miniText: "text-xs font-semibold text-slate-600",
  timelineItem: "rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700",
  emptyState:
    "mt-5 flex min-h-[300px] flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center",
  emptyTitle: "mt-4 text-xl font-black text-black",
  emptyText: "mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-700",
  gpsPill:
    "mt-4 rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-700",
  errorBox:
    "mt-5 rounded-2xl bg-purple-50 p-4 text-sm font-black text-purple-800",
  responseBox: "rounded-[20px] bg-slate-50 p-5",
  responseTitle: "text-xl font-black text-black",
  responseText: "mt-3 text-sm font-semibold leading-7 text-slate-700",
  nextStepBox: "mt-4 rounded-xl bg-purple-50 px-4 py-3 text-black",
  infoCard: "mt-4 rounded-[16px] bg-slate-50 p-4 text-slate-700"
};

const darkTheme = {
  ...lightTheme,
  page: "relative min-h-screen bg-[#111827] px-4 py-6 font-['Times_New_Roman',Times,serif] text-[#F8FAFC]",
  heroCard:
    "rounded-[22px] border border-white/10 bg-gradient-to-br from-[#283750] via-[#1D293D] to-[#111827] p-6 shadow-xl shadow-black/35 md:p-8",
  mobileHeroCard:
    "mx-auto max-w-md rounded-[24px] border border-white/10 bg-[#1D293D] p-5 shadow-xl shadow-black/35",
  demoPanel:
    "rounded-[18px] border border-white/10 bg-[#1D293D] p-5 shadow-md shadow-black/30",
  demoButton:
    "w-full rounded-2xl bg-blue-600 px-6 py-5 text-lg font-black text-white shadow transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  card: "rounded-[18px] border border-white/10 bg-[#1D293D] p-5 shadow-md shadow-black/25",
  logoMark:
    "inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#EDE9FE]",
  kicker: "mt-6 text-sm font-extrabold uppercase tracking-[0.12em] text-[#CBD5E1]",
  mobileKicker:
    "mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#CBD5E1]",
  heroTitle:
    "mt-2 max-w-3xl text-4xl font-black leading-[1.02] text-[#F8FAFC] md:text-6xl",
  mobileHeroTitle:
    "mt-2 text-2xl font-black leading-tight text-[#F8FAFC]",
  subText: "mt-4 max-w-2xl text-base font-semibold leading-8 text-[#CBD5E1]",
  mobileSubText:
    "mt-3 text-sm font-semibold leading-6 text-[#CBD5E1]",
  themeButton:
    "flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow transition hover:scale-105 active:bg-green-600",
  viewButton:
    "flex h-14 min-w-28 items-center justify-center rounded-full bg-gradient-to-r from-purple-300 to-pink-400 px-5 text-xs font-black text-[#111827] shadow transition hover:scale-105 active:bg-none active:bg-blue-600 active:text-white",
  menuButton:
    "flex h-12 w-12 items-center justify-center rounded-full bg-[#283750] text-[#F8FAFC] shadow transition hover:scale-105 active:bg-[#9B8AFB] active:text-[#111827]",
  menuIcon:
    "grid w-5 gap-1 [&>span]:block [&>span]:h-0.5 [&>span]:rounded-full [&>span]:bg-current",
  menuBackdrop:
    "fixed inset-0 z-30 cursor-default bg-black/30 backdrop-blur-[1px]",
  menuPanel:
    "fixed left-4 top-20 z-40 grid w-64 gap-1 rounded-[18px] border border-white/10 bg-[#1D293D] p-3 text-[#F8FAFC] shadow-2xl shadow-black/45",
  menuHeader:
    "mb-2 border-b border-white/10 px-3 pb-3 pt-2",
  menuItem:
    "rounded-xl px-4 py-3 text-left text-sm font-black transition hover:bg-[#283750] active:bg-[#9B8AFB] active:text-[#111827]",
  phoneShell:
    "rounded-[24px] border border-white/10 bg-[#1D293D] p-5 shadow-xl shadow-black/35",
  watchBubble:
    "flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl",
  mobileCrisisButton:
    "min-h-[78px] rounded-[22px] bg-[#283750] px-5 py-5 text-left text-2xl font-black text-[#F8FAFC] shadow transition hover:scale-[1.01] disabled:opacity-60",
  mobileCrisisSelectedButton:
    "min-h-[78px] rounded-[22px] bg-blue-600 px-5 py-5 text-left text-2xl font-black text-white shadow transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileActionButton:
    "min-h-[64px] rounded-[18px] bg-[#283750] px-5 py-4 text-left text-lg font-extrabold text-[#F8FAFC] shadow-sm transition hover:scale-[1.01] disabled:opacity-60",
  mobileActionSelectedButton:
    "min-h-[64px] rounded-[18px] bg-blue-600 px-5 py-4 text-left text-lg font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileVoiceButton:
    "min-h-[64px] w-full rounded-[18px] bg-blue-600 px-5 py-4 text-center text-xl font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileVoiceSelectedButton:
    "min-h-[64px] w-full rounded-[18px] bg-blue-600 px-5 py-4 text-center text-xl font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileMonitorButton:
    "mt-3 min-h-[64px] w-full rounded-[18px] bg-green-600 px-5 py-4 text-center text-xl font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-green-700 disabled:opacity-60",
  mobileStopButton:
    "min-h-[64px] w-full rounded-[18px] bg-blue-600 px-5 py-4 text-center text-xl font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileDemoButton:
    "mt-3 min-h-[62px] w-full rounded-[18px] bg-blue-600 px-5 py-4 text-center text-lg font-black text-white shadow-sm transition hover:scale-[1.01] active:bg-blue-700 disabled:opacity-60",
  mobileStatus:
    "mt-4 rounded-2xl bg-[#283750] px-4 py-3 text-center text-xs font-black text-[#CBD5E1]",
  mobileResponseBox:
    "rounded-[22px] bg-[#283750] p-5 text-[#F8FAFC]",
  cameraBox:
    "rounded-[18px] border border-white/10 bg-[#111827] p-3",
  chatBox:
    "relative mt-4",
  chatSendButton:
    "absolute bottom-3 right-3 rounded-xl bg-[#283750] px-4 py-2 text-sm font-black text-[#F8FAFC] shadow-sm transition active:bg-[#9B8AFB] active:text-[#111827] disabled:opacity-60",
  chatSendActive:
    "absolute bottom-3 right-3 rounded-xl bg-[#9B8AFB] px-4 py-2 text-sm font-black text-[#111827] shadow-sm disabled:opacity-60",
  primaryButton:
    "rounded-2xl bg-blue-600 px-6 py-5 text-lg font-black text-white shadow transition hover:scale-[1.02] active:bg-blue-700 disabled:opacity-60",
  secondaryButton:
    "rounded-2xl bg-[#283750] px-6 py-5 text-lg font-black text-[#F8FAFC] shadow transition hover:scale-[1.02] disabled:opacity-60",
  softButton:
    "mt-5 w-full rounded-2xl bg-[#283750] px-5 py-4 text-sm font-black text-[#F8FAFC] shadow-sm transition hover:scale-[1.02]",
  voiceButton:
    "mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-blue-700 disabled:opacity-60",
  monitorButton:
    "mt-5 w-full rounded-2xl bg-green-600 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-green-700 disabled:opacity-60",
  dangerButton:
    "rounded-2xl bg-blue-600 px-6 py-5 text-lg font-black text-white shadow transition hover:scale-[1.02] active:bg-blue-700 disabled:opacity-60",
  input:
    "w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm font-semibold text-[#F8FAFC] outline-none focus:border-[#9B8AFB]",
  iconBox:
    "flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-xl",
  sectionTitle: "text-2xl font-black text-[#F8FAFC]",
  sectionDescription: "mt-2 text-sm font-semibold leading-7 text-[#CBD5E1]",
  label:
    "mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#CBD5E1]",
  statusBox:
    "mt-4 rounded-xl bg-[#283750] p-3 text-center text-xs font-black text-[#CBD5E1]",
  segment: "mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#111827] p-2",
  segmentActive:
    "rounded-xl bg-[#9B8AFB] px-3 py-3 text-sm font-black text-[#111827] shadow",
  segmentInactive:
    "rounded-xl px-3 py-3 text-sm font-black text-[#CBD5E1] hover:bg-[#283750]",
  liveBox: "mt-5 rounded-2xl bg-[#283750] p-5 text-[#F8FAFC]",
  alarmBox:
    "mt-4 rounded-2xl border border-green-400/30 bg-green-500/20 p-5 text-green-100 shadow-sm",
  alarmDismissButton:
    "mt-3 rounded-xl bg-green-500 px-4 py-2 text-sm font-black text-white transition active:bg-green-600",
  saveButton:
    "mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-blue-700",
  uploadButton:
    "mt-5 flex w-full cursor-pointer items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:scale-[1.02] active:bg-blue-700",
  photoMemoryCard:
    "rounded-[18px] border border-white/10 bg-[#111827] p-3 text-[#F8FAFC]",
  scheduleRow:
    "grid grid-cols-[92px_1fr] gap-3 rounded-xl border border-white/10 bg-[#111827] p-3",
  scheduleTimeInput:
    "w-full rounded-lg border border-white/10 bg-[#1D293D] px-3 py-2 text-sm font-black text-[#F8FAFC] outline-none focus:border-blue-500",
  scheduleLabelInput:
    "w-full rounded-lg border border-white/10 bg-[#1D293D] px-3 py-2 text-sm font-semibold text-[#F8FAFC] outline-none focus:border-blue-500",
  miniText: "text-xs font-semibold text-[#CBD5E1]",
  timelineItem: "rounded-xl bg-[#283750] px-4 py-3 text-sm font-semibold text-[#CBD5E1]",
  emptyState:
    "mt-5 flex min-h-[330px] flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-[#283750] px-6 text-center",
  emptyTitle: "mt-4 text-2xl font-black text-[#F8FAFC]",
  emptyText: "mt-2 max-w-sm text-sm font-semibold leading-7 text-[#CBD5E1]",
  gpsPill:
    "mt-4 rounded-xl bg-[#111827] px-4 py-2 text-xs font-black text-[#CBD5E1]",
  errorBox:
    "mt-5 rounded-2xl bg-[#F2D5D2] p-4 text-sm font-black text-[#8A4642]",
  responseBox: "rounded-[22px] bg-[#283750] p-5",
  responseTitle: "text-2xl font-black text-[#F8FAFC]",
  responseText: "mt-3 text-base font-semibold leading-8 text-[#CBD5E1]",
  nextStepBox: "mt-4 rounded-xl bg-[#9B8AFB] px-4 py-3 text-[#111827]",
  infoCard: "mt-4 rounded-[16px] bg-[#283750] p-4 text-[#CBD5E1]"
};
