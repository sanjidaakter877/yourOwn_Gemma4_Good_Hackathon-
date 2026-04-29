"use client";

import Link from 'next/link';
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from "react";

function LegacyHome() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>yourOwn</h1>
        <p style={styles.subtitle}>AI Companion for Alzheimer's Care</p>
      </header>

      <main style={styles.main}>
        <div style={styles.heroSection}>
          <h2 style={styles.heroTitle}>
            Privacy-First AI Support Powered by Gemma 4
          </h2>
          <p style={styles.heroText}>
            Personalized voice recognition • Real-time safety monitoring • Medical insights for doctors
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
                Track patient progression. Receive alerts. Make informed decisions.
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
                Real-time GPS tracking prevents wandering
              </p>
            </div>

            <div style={styles.featureBox}>
              <span style={styles.featureIcon}>💊</span>
              <h4 style={styles.featureTitle}>Medication Tracking</h4>
              <p style={styles.featureText}>
                Reminds & tracks medication adherence
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
                All data local. Runs offline. No cloud.
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
  recent: {
    timestamp: string;
    transcript: string;
    riskLevel: string;
    score: number;
    flags: string[];
  }[];
};

type PhotoMemory = {
  id: string;
  imageDataUrl: string;
  name: string;
  relationship: string;
  description: string;
};

type AssistResponse = {
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
  audio_base64?: string | null;
  audio_mime_type?: string | null;
};

type GemmaStatus = {
  local_inference: boolean;
  provider: string;
  model: string;
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

export default function Home() {
  const [theme, setTheme] = useState<ThemeName>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("laptop");
  const [speakerRole, setSpeakerRole] = useState<RoleName>("patient");

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
  const [saveStatus, setSaveStatus] = useState("");

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const gpsWatchIdRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const lastAlarmKeyRef = useRef("");
  const speechRecognitionRef = useRef<any>(null);
  const liveMonitoringRef = useRef(false);
  const rolePanelRef = useRef<HTMLDivElement | null>(null);

  const currentTheme = theme === "light" ? lightTheme : darkTheme;

  useEffect(() => {
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
    fetch("http://localhost:5000/api/gemma/status")
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
    } catch {
      setSaveStatus("");
    }
  }, []);

  const fetchSeverityTrend = async () => {
    try {
      const res = await fetch("http://localhost:5000/doctor/mary/severity-trend");
      if (!res.ok) return;
      const data: SeverityTrend = await res.json();
      setSeverityTrend(data);
    } catch {
      setSeverityTrend(null);
    }
  };

  useEffect(() => {
    fetchSeverityTrend();
  }, []);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      speechRecognitionRef.current?.stop?.();
    };
  }, []);

  const currentClock = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

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
      photoMemories
    };

    window.localStorage.setItem("yourown-care-info", JSON.stringify(data));
    setSaveStatus(`Saved at ${currentClock}`);
    addLog("Care information saved");
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
      photoMemories: photoMemories.map(({ imageDataUrl, ...photo }) => photo)
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
    if (!data.audio_base64 || !data.audio_mime_type) return;

    const audio = new Audio(
      `data:${data.audio_mime_type};base64,${data.audio_base64}`
    );

    await audio.play();
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

      setCameraActive(true);
      setCameraStatus("Camera active");
    } catch {
      setCameraStatus("Camera permission denied or unavailable.");
    }
  };

  const stopCamera = () => {
    setActiveCameraButton("stop");
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraStatus("Camera stopped");
  };

  const captureCameraFrame = () => {
    setActiveCameraButton("capture");
    const video = videoRef.current;

    if (!video || !cameraActive || video.videoWidth === 0) {
      setCameraStatus("Start the camera before capturing.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraStatus("Could not capture camera frame.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.82);
    setCapturedImage(imageData);
    setVisualDescription("");
    setImageLabels("");
    setVisualConcern("");
    setCameraStatus("Frame captured. Add labels only if you want to describe what is visible.");
  };

  const handleAssist = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(getPayload())
      });

      const data: AssistResponse & { error?: string } = await res.json();

      if (!res.ok) throw new Error(data?.error || "Request failed");

      setResult(data);
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

  const sendLiveMonitoringAssist = async (transcript: string) => {
    if (loading) return;

    setLoading(true);
    setError("");
    setSpeechText(transcript);

    try {
      const payload = getPayload();
      const res = await fetch("http://localhost:5000/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...payload,
          signals: {
            ...payload.signals,
            speakerRole: "patient",
            speechText: transcript
          }
        })
      });

      const data: AssistResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data?.error || "Live monitor request failed");

      setResult(data);
      addLog(`Live monitor heard: ${transcript}`);
      fetchSeverityTrend();
      await playAudio(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not process live monitoring";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const startLiveMonitoring = () => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setLiveMonitoringStatus(
        "Live mic monitoring is not supported in this browser. Use Speak instead."
      );
      return;
    }

    ensureGpsWatching();
    liveMonitoringRef.current = true;
    setLiveMonitoring(true);
    setLiveMonitoringStatus("Listening for confusion and safety concerns...");

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = spokenLanguage === "English" ? "en-US" : undefined;

    recognition.onresult = (event: any) => {
      const latest = event.results[event.results.length - 1];
      const transcript = String(latest?.[0]?.transcript || "").trim();
      if (!transcript) return;

      setLiveMonitoringStatus(`Heard: ${transcript}`);

      if (isConfusionOrSafetySpeech(transcript)) {
        sendLiveMonitoringAssist(transcript);
      }
    };

    recognition.onerror = () => {
      setLiveMonitoringStatus("Live mic paused. Check microphone permission.");
    };

    recognition.onend = () => {
      if (!liveMonitoringRef.current) return;
      try {
        recognition.start();
      } catch {
        setLiveMonitoringStatus("Live mic is waiting to restart.");
      }
    };

    speechRecognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setLiveMonitoringStatus("Live mic is already starting.");
    }
  };

  const stopLiveMonitoring = () => {
    liveMonitoringRef.current = false;
    setLiveMonitoring(false);
    setLiveMonitoringStatus("Live monitor is off");
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
    /\b(where am i|who am i|who are you|lost|scared|afraid|confused|help|hurt|fall|fell|pain|medicine|pill|dose|home)\b/i.test(
      text
    );

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
      const res = await fetch("http://localhost:5000/assist", {
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm"
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm"
        });
        await sendVoiceToBackend(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      setError("Microphone permission failed. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    setRecording(false);
    setLoading(true);
    mediaRecorderRef.current.stop();
  };

  const sendVoiceToBackend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("payload", JSON.stringify(getPayload()));

      const res = await fetch("http://localhost:5000/assist/voice", {
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

  const topOptionClass = (role: "family" | "doctor") =>
    speakerRole === role
      ? currentTheme.topOptionActive
      : currentTheme.topOptionInactive;

  return (
    <main className={currentTheme.page}>
      <div className="relative z-10 mx-auto max-w-7xl">
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
                  ? "Patient companion"
                  : "Live care companion"}
              </p>
              <h1
                className={
                  viewMode === "mobile"
                    ? currentTheme.mobileHeroTitle
                    : currentTheme.heroTitle
                }
              >
                {viewMode === "mobile"
                  ? "Calm help in your pocket."
                  : "Understand the moment, not just the message."}
              </h1>
              <p
                className={
                  viewMode === "mobile"
                    ? currentTheme.mobileSubText
                    : currentTheme.subText
                }
              >
                {viewMode === "mobile"
                  ? "Speak, send a message, or start live monitoring for simple reassurance."
                  : "Real-time voice, GPS, schedule, memory, language, and protected care roles."}
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
                      : "local status pending"
                  }
                  tone={gemmaStatus?.local_inference ? "low" : "medium"}
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
                    ? "grid grid-cols-2 gap-2"
                    : "flex flex-wrap justify-end gap-2"
                }
              >
                <button
                  onClick={isFamilyRole ? openPatientRole : () => openProtectedRole("family")}
                  className={topOptionClass("family")}
                >
                  {isFamilyRole ? "Patient Dashboard" : "Family Dashboard"}
                </button>
                <button
                  onClick={isDoctorRole ? openPatientRole : () => openProtectedRole("doctor")}
                  className={topOptionClass("doctor")}
                >
                  {isDoctorRole ? "Patient Dashboard" : doctorUnlocked ? "Doctor Dashboard" : "Doctor Login"}
                </button>
              </div>
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
            {isPatientRole && (
            <div ref={rolePanelRef}>
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="👤"
                title="Patient mode"
                description="Patient mode is open. Use the top-right menu for family and doctor access."
                theme={currentTheme}
              />

              <button
                onClick={() => setSpeakerRole("patient")}
                className={currentTheme.selectedButton}
              >
                <span className="mr-2">{getRoleEmoji("patient")}</span>
                Patient
              </button>
            </Card>
            </div>
            )}

            {viewMode === "laptop" && isPatientRole && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="🎙️"
                title="Live voice"
                description="Speak naturally. It listens, reasons, and speaks back."
                theme={currentTheme}
              />

                <div className="mt-5">
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={loading || isProtectedRoleLocked}
                  className={
                    recording
                      ? currentTheme.dangerButton
                      : currentTheme.voiceButton
                  }
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
                    Save reminder times
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
          </section>
          )}

          <section className="space-y-5">
            {viewMode === "laptop" && isPatientRole && (
            <Card theme={currentTheme}>
              <SectionTitle
                emoji="💬"
                title="Care response"
                description="Patient reassurance, risk, evidence, and action plan."
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
                onSave={saveCareInfo}
                result={result}
                saveStatus={saveStatus}
                severityTrend={severityTrend}
                setClinicalAssessment={setClinicalAssessment}
                setDoctorNote={setDoctorNote}
                setFollowUpPlan={setFollowUpPlan}
                setMedicationPlan={setMedicationPlan}
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
                saveStatus={saveStatus}
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
                    Save changes
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

function DoctorDashboard({
  clinicalAssessment,
  currentTheme,
  doctorNote,
  followUpPlan,
  medicationPlan,
  onSave,
  result,
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
  onSave: () => void;
  result: AssistResponse | null;
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
      </InfoCard>

      <div className="mt-5 grid gap-4">
        <Field label="Clinical assessment" theme={currentTheme}>
          <textarea
            value={clinicalAssessment}
            onChange={(e) => setClinicalAssessment(e.target.value)}
            className={`${currentTheme.input} min-h-[92px] resize-none`}
          />
        </Field>

        <Field label="Medication / care plan" theme={currentTheme}>
          <textarea
            value={medicationPlan}
            onChange={(e) => setMedicationPlan(e.target.value)}
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
        Save doctor updates
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
        Save family updates
      </button>
      {saveStatus && <p className={currentTheme.miniText}>{saveStatus}</p>}
    </Card>
  );
}

function MobilePatientMode({
  currentClock,
  currentTheme,
  error,
  gpsStatus,
  handleAssist,
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

        <div className="mt-5">
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
            className={
              recording
                ? currentTheme.mobileStopButton
                : activePatientButton === "speak"
                  ? currentTheme.mobileVoiceSelectedButton
                  : currentTheme.mobileVoiceButton
            }
          >
            {recording ? "⏹ Stop" : "🎙️ Speak"}
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

        {result && <MobileResult result={result} theme={currentTheme} />}
      </div>
    </section>
  );
}

function MobileResult({
  result,
  theme
}: {
  result: AssistResponse;
  theme: typeof lightTheme;
}) {
  return (
    <div className="mt-5 space-y-3">
      <div className={theme.mobileResponseBox}>
        <p className="text-2xl font-black">{result.response.reassurance}</p>
        <p className="mt-3 text-base font-bold leading-7">
          {result.response.context}
        </p>
        <p className="mt-4 rounded-2xl bg-white/70 p-3 text-sm font-black">
          {result.response.next_step}
        </p>
      </div>

      {result.care_reasoning && (
        <div className="grid grid-cols-2 gap-3">
          <SignalPill
            label="Risk"
            value={result.care_reasoning.risk.level.toUpperCase()}
            tone={result.care_reasoning.risk.level}
          />
          <SignalPill
            label="Grounding"
            value={
              result.care_reasoning.verification.safe_to_send
                ? "Verified"
                : "Review"
            }
            tone={
              result.care_reasoning.verification.safe_to_send ? "low" : "high"
            }
          />
        </div>
      )}
    </div>
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
  theme
}: {
  result: AssistResponse;
  theme: typeof lightTheme;
}) {
  return (
    <div className="mt-5 space-y-4">
      {result.transcript && (
        <InfoCard title="Transcript" theme={theme}>
          <Bullet>{result.transcript}</Bullet>
        </InfoCard>
      )}

      <div className={theme.responseBox}>
        <p className={theme.responseTitle}>{result.response.reassurance}</p>
        <p className={theme.responseText}>{result.response.context}</p>
        <div className={theme.nextStepBox}>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">
            Next step
          </p>
          <p className="mt-1 text-lg font-black">{result.response.next_step}</p>
        </div>
      </div>

      {result.care_reasoning && (
        <InfoCard title="Gemma care reasoning" theme={theme}>
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
  topOptionActive:
    "min-h-12 rounded-full bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-sm transition hover:scale-105",
  topOptionInactive:
    "min-h-12 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-black text-black shadow-sm transition hover:scale-105 active:border-blue-600 active:bg-blue-600 active:text-white",
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
  topOptionActive:
    "min-h-14 rounded-full bg-[#9B8AFB] px-4 py-3 text-xs font-black text-[#111827] shadow transition hover:scale-105",
  topOptionInactive:
    "min-h-14 rounded-full bg-[#283750] px-4 py-3 text-xs font-black text-[#F8FAFC] shadow transition hover:scale-105",
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
