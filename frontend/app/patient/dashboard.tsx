"use client";

import React, { CSSProperties, useMemo, useRef, useState, useEffect } from "react";
import { apiUrl } from "../../lib/api";

const OFFLINE_RESPONSES: Record<Stage, { reassurance: string; context: string; next_step: string; alert?: string } | null> = {
  none: null,
  guidance: {
    reassurance: "Mary, you are in the kitchen making tea.",
    context: "It is a normal afternoon routine. Your kettle and mug are nearby.",
    next_step: "Take your time — everything looks good here."
  },
  check_in: {
    reassurance: "Mary, I noticed you have been quiet for a moment.",
    context: "You were making tea in the kitchen. No progress detected for 15 seconds.",
    next_step: "Are you okay? Do you need any help right now?"
  },
  hearing_check: {
    reassurance: "Mary, I am still here with you.",
    context: "You have not responded to my last check-in.",
    next_step: "Can you say yes or give me a nod so I know you can hear me?"
  },
  caregiver_warning: {
    reassurance: "Mary, I want to make sure you are safe.",
    context: "You have been quiet through several check-ins.",
    next_step: "If you cannot respond, I may need to let your family know. Are you okay?"
  },
  alert_sent: {
    reassurance: "Mary, I am still here with you.",
    context: "I have not been able to reach you after repeated check-ins.",
    next_step: "I am letting your family know now. Please stay where you are.",
    alert: "Caregiver alert sent: Mary has not responded after repeated check-ins while making tea in the kitchen."
  }
};

type Stage =
  | "none"
  | "guidance"
  | "check_in"
  | "hearing_check"
  | "caregiver_warning"
  | "alert_sent";

type AssistResult = {
  response?: {
    reassurance?: string;
    context?: string;
    next_step?: string;
  };
  care_reasoning?: {
    risk?: {
      level?: string;
      score?: number;
      flags?: string[];
    };
    evidence?: string[];
    gemma_function_calls?: string[];
    multimodal_image_used?: boolean;
  };
  escalation?: {
    stage?: Stage;
    shouldAlertCaregiver?: boolean;
  };
  family_alert?: {
    sent?: boolean;
    reason?: string;
    alert?: {
      message?: string;
      caregiverName?: string;
      type?: string;
    };
  };
  ollama_meta?: {
    model?: string;
    inference_ms?: number;
    function_calls?: string[];
    vision_used?: boolean;
    local?: boolean;
  };
};

const stageLabels: Record<Stage, string> = {
  none: "Ready",
  guidance: "Guidance",
  check_in: "Check-in",
  hearing_check: "Hearing check",
  caregiver_warning: "Caregiver warning",
  alert_sent: "Alert sent"
};

const stageDescriptions: Record<Stage, string> = {
  none: "Mary has not started the routine yet.",
  guidance: "Mary is making tea. yourOwn is watching for task progress.",
  check_in: "The system detected no progress for 15 seconds.",
  hearing_check: "Mary still has not responded after a check-in.",
  caregiver_warning: "yourOwn warns that a caregiver may be contacted.",
  alert_sent: "A trusted caregiver notification has been sent."
};

export default function PatientDashboard() {
  const [stage, setStage] = useState<Stage>("none");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [caregiverAlert, setCaregiverAlert] = useState("");
  const [timeline, setTimeline] = useState<string[]>([
    "Demo ready: Mary will begin making tea in the kitchen."
  ]);
  const [risk, setRisk] = useState<"Low" | "Medium" | "High">("Low");
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [ollamaMeta, setOllamaMeta] = useState<AssistResult["ollama_meta"] | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startWebcam = async () => {
    setWebcamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setWebcamActive(true);
    } catch {
      setWebcamError("Camera unavailable — demo will use pre-set visual context.");
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current || !webcamActive) return null;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7);
  };

  const evidence = useMemo(
    () => ({
      task: "Making tea",
      room: "Kitchen",
      signal:
        stage === "none" || stage === "guidance"
          ? "Routine active"
          : "No progress for 15 seconds",
      emotion:
        stage === "none" || stage === "guidance"
          ? "Monitoring"
          : "Uncertainty detected",
      risk: `${risk}${stage === "alert_sent" ? "" : risk === "Medium" ? " -> High" : ""}`,
      stage: stageLabels[stage]
    }),
    [risk, stage]
  );

  const addTimeline = (item: string) => {
    setTimeline((current) => [item, ...current].slice(0, 6));
  };

  const startTeaRoutine = () => {
    setStage("guidance");
    setRisk("Low");
    setAiResponse("");
    setCaregiverAlert("");
    setError("");
    setTimeline(["Mary starts making tea in the kitchen."]);
  };

  const triggerSilentPause = () => {
    setStage("check_in");
    setRisk("Medium");
    addTimeline("Silent pause detected: no step completed for 15 seconds.");
  };

  const simulateNoResponse = () => {
    setStage("hearing_check");
    setRisk("Medium");
    addTimeline("Mary does not answer the first check-in.");
  };

  const showAiResponse = async () => {
    const nextStage = stage === "none" ? "guidance" : stage;
    await runAssist(nextStage, false);
  };

  const showCaregiverAlert = async () => {
    await runAssist("alert_sent", true);
  };

  const runAssist = async (requestedStage: Stage, alertRequested: boolean) => {
    setLoading(true);
    setError("");
    setIsOffline(false);

    const capturedImage = captureFrame();

    try {
      const response = await fetch(apiUrl("/assist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            userName: "Mary",
            mainLanguage: "English"
          },
          signals: {
            speakerRole: "patient",
            speechText: "",
            room: "kitchen",
            task: "making tea",
            capturedImage: capturedImage || undefined,
            currentClock: new Date().toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit"
            }),
            timeOfDay: "afternoon",
            lastEvent: "started making tea, then silently paused",
            visualDescription:
              "Mary is standing at the kitchen counter with a mug and kettle nearby.",
            visualConcern: "routine_pause",
            imageLabels: ["mug", "kettle", "counter"],
            behaviorSignals: {
              quietPause: true,
              noProgress: true,
              hesitation: requestedStage !== "guidance",
              repeatedSilentCheck: ["hearing_check", "caregiver_warning", "alert_sent"].includes(
                requestedStage
              ),
              liveSilenceCheckCount: getSilentCheckCount(requestedStage),
              capturedImageAvailable: true,
              microphoneStatus: "available"
            },
            conversationState: {
              turnType: "silent_check",
              stage: requestedStage,
              silentCheckCount: getSilentCheckCount(requestedStage),
              task: "making tea",
              room: "kitchen",
              shouldAlertCaregiver: alertRequested
            },
            humeEmotion: {
              available: true,
              expression_summary: "Uncertainty detected",
              top_emotions: [{ name: "Doubt", score: 0.72 }]
            }
          }
        })
      });

      const data: AssistResult = await response.json();
      const spoken = [
        data.response?.reassurance,
        data.response?.context,
        data.response?.next_step
      ]
        .filter(Boolean)
        .join(" ");

      setStage(requestedStage);
      setRisk(requestedStage === "alert_sent" || requestedStage === "caregiver_warning" ? "High" : "Medium");
      setAiResponse(spoken || "Mary, I am here with you. Are you okay?");
      if (data.ollama_meta) setOllamaMeta(data.ollama_meta);

      if (data.family_alert?.sent || requestedStage === "alert_sent") {
        setCaregiverAlert(
          data.family_alert?.alert?.message ||
            "Caregiver alert sent: Mary has not responded after repeated check-ins while making tea in the kitchen."
        );
      }

      addTimeline(
        requestedStage === "alert_sent"
          ? "Alert sent to family/caregiver."
          : `AI response generated for ${stageLabels[requestedStage].toLowerCase()} stage.`
      );
    } catch {
      const offline = OFFLINE_RESPONSES[requestedStage];
      if (offline) {
        const spoken = [offline.reassurance, offline.context, offline.next_step].filter(Boolean).join(" ");
        setStage(requestedStage);
        setRisk(requestedStage === "alert_sent" || requestedStage === "caregiver_warning" ? "High" : "Medium");
        setAiResponse(spoken);
        setIsOffline(true);
        if (offline.alert) setCaregiverAlert(offline.alert);
        addTimeline(
          requestedStage === "alert_sent"
            ? "Alert sent to family/caregiver (demo mode)."
            : `AI response generated for ${stageLabels[requestedStage].toLowerCase()} stage (demo mode).`
        );
      } else {
        setError("Backend unavailable. Start the tea routine first to use demo mode.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <p style={styles.kicker}>yourOwn demo flow</p>
        <h1 style={styles.title}>Silent disorientation escalation</h1>
        <p style={styles.subtitle}>
          yourOwn detects silent disorientation, restores reality, and escalates safely when Mary cannot respond.
        </p>
      </header>

      <main style={styles.main}>
        <section style={styles.panel}>
          <div style={styles.sceneHeader}>
            <div>
              <p style={styles.kickerDark}>Patient scene</p>
              <h2 style={styles.sectionTitle}>Mary is making tea</h2>
            </div>
            <span style={styles.stagePill}>{stageLabels[stage]}</span>
          </div>

          <div style={styles.sceneBox}>
            <p style={styles.sceneText}>{stageDescriptions[stage]}</p>
            {aiResponse ? <p style={styles.aiSpeech}>{aiResponse}</p> : null}
            {caregiverAlert ? <p style={styles.alertSpeech}>{caregiverAlert}</p> : null}
          </div>

          <div style={styles.webcamRow}>
            <div style={styles.webcamBox}>
              <video ref={videoRef} style={styles.webcamVideo} muted playsInline />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {!webcamActive && (
                <div style={styles.webcamPlaceholder}>
                  <p style={styles.webcamPlaceholderText}>Camera off</p>
                </div>
              )}
            </div>
            <div style={styles.webcamControls}>
              <p style={styles.kickerDark}>Live camera</p>
              <p style={styles.webcamDesc}>
                {webcamActive
                  ? "Gemma 4 receives a live camera frame with each AI request."
                  : "Enable camera so Gemma 4 can see the patient scene in real time."}
              </p>
              {!webcamActive && (
                <button type="button" style={styles.button} onClick={startWebcam}>
                  Enable Camera
                </button>
              )}
              {webcamActive && (
                <span style={styles.localBadge}>Camera active</span>
              )}
              {webcamError && (
                <p style={styles.offlineBadge}>{webcamError}</p>
              )}
            </div>
          </div>

          <div style={styles.buttonGrid}>
            <button style={styles.button} onClick={startTeaRoutine} disabled={loading}>
              Start Tea Routine
            </button>
            <button style={styles.button} onClick={triggerSilentPause} disabled={loading}>
              Trigger Silent Pause
            </button>
            <button style={styles.button} onClick={simulateNoResponse} disabled={loading}>
              Simulate No Response
            </button>
            <button style={styles.button} onClick={showAiResponse} disabled={loading}>
              {loading ? "Generating..." : "Show AI Response"}
            </button>
            <button style={styles.alertButton} onClick={showCaregiverAlert} disabled={loading}>
              Show Caregiver Alert
            </button>
          </div>

          {error ? <p style={styles.error}>{error}</p> : null}
          {isOffline ? (
            <p style={styles.offlineBadge}>Demo mode — backend offline. Responses are pre-scripted.</p>
          ) : null}
        </section>

        <section style={styles.panel}>
          <p style={styles.kickerDark}>Engineering evidence</p>
          <h2 style={styles.sectionTitle}>Decision trace</h2>

          <div style={styles.evidenceGrid}>
            <Evidence label="Task" value={evidence.task} />
            <Evidence label="Room" value={evidence.room} />
            <Evidence label="Signal" value={evidence.signal} />
            <Evidence label="Emotion" value={evidence.emotion} />
            <Evidence label="Risk" value={evidence.risk} />
            <Evidence label="Stage" value={evidence.stage} />
          </div>
        </section>

        <section style={styles.panel}>
          <p style={styles.kickerDark}>Timeline</p>
          <h2 style={styles.sectionTitle}>Demo beats</h2>
          <div style={styles.timeline}>
            {timeline.map((item, index) => (
              <p key={`${item}-${index}`} style={styles.timelineItem}>
                {item}
              </p>
            ))}
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.ollamaHeader}>
            <div>
              <p style={styles.kickerDark}>Local inference</p>
              <h2 style={styles.sectionTitle}>Gemma 4 via Ollama</h2>
            </div>
            <span style={ollamaMeta?.local ? styles.localBadge : styles.localBadgeOff}>
              {ollamaMeta?.local ? "Running locally" : "Waiting for response"}
            </span>
          </div>
          <div style={styles.evidenceGrid}>
            <Evidence label="Model" value={ollamaMeta?.model ?? "gemma4:e4b"} />
            <Evidence label="Inference" value={ollamaMeta?.inference_ms != null ? `${ollamaMeta.inference_ms} ms` : "—"} />
            <Evidence label="Vision used" value={ollamaMeta?.vision_used ? "Yes — camera frame" : "No"} />
            <Evidence label="Function calls" value={ollamaMeta?.function_calls?.length ? ollamaMeta.function_calls.join(" → ") : "—"} />
            <Evidence label="Privacy" value="No cloud — 100% on-device" />
            <Evidence label="Internet required" value="No" />
          </div>
        </section>
      </main>
    </div>
  );
}

function Evidence({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.evidenceItem}>
      <p style={styles.evidenceLabel}>{label}</p>
      <p style={styles.evidenceValue}>{value}</p>
    </div>
  );
}

function getSilentCheckCount(stage: Stage) {
  if (stage === "guidance") return 1;
  if (stage === "check_in") return 2;
  if (stage === "hearing_check") return 3;
  if (stage === "caregiver_warning") return 4;
  if (stage === "alert_sent") return 5;
  return 0;
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F7F4ED",
    color: "#1F2933",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  header: {
    backgroundColor: "#1F2933",
    color: "white",
    padding: "34px 20px 30px",
    textAlign: "center"
  },
  kicker: {
    margin: "0 0 10px",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: "uppercase",
    color: "#B8E0D2"
  },
  kickerDark: {
    margin: 0,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: "uppercase",
    color: "#52616B"
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.08
  },
  subtitle: {
    margin: "14px auto 0",
    maxWidth: 760,
    color: "#E6EEF2",
    fontSize: 16,
    lineHeight: 1.6
  },
  main: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "24px 18px 40px",
    display: "grid",
    gap: 16
  },
  panel: {
    backgroundColor: "white",
    border: "1px solid #E1DED5",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 8px 22px rgba(31, 41, 51, 0.08)"
  },
  sceneHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start"
  },
  sectionTitle: {
    margin: "4px 0 0",
    fontSize: 24,
    lineHeight: 1.2
  },
  stagePill: {
    border: "1px solid #78A083",
    color: "#214D36",
    backgroundColor: "#EAF5ED",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap"
  },
  sceneBox: {
    marginTop: 18,
    backgroundColor: "#F5F7F8",
    borderRadius: 8,
    padding: 16,
    border: "1px solid #DFE5E8"
  },
  sceneText: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.55,
    fontWeight: 700
  },
  aiSpeech: {
    margin: "14px 0 0",
    padding: 14,
    backgroundColor: "#EAF2FF",
    borderLeft: "4px solid #2F6FED",
    borderRadius: 6,
    color: "#173B73",
    lineHeight: 1.55
  },
  alertSpeech: {
    margin: "14px 0 0",
    padding: 14,
    backgroundColor: "#FFF0E6",
    borderLeft: "4px solid #D36B27",
    borderRadius: 6,
    color: "#763512",
    lineHeight: 1.55,
    fontWeight: 700
  },
  buttonGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10
  },
  button: {
    minHeight: 54,
    border: "1px solid #B8C2CC",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#1F2933",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer"
  },
  alertButton: {
    minHeight: 54,
    border: "1px solid #B95021",
    borderRadius: 8,
    backgroundColor: "#D85F27",
    color: "white",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer"
  },
  error: {
    margin: "14px 0 0",
    color: "#9D174D",
    fontWeight: 800
  },
  offlineBadge: {
    margin: "10px 0 0",
    padding: "8px 12px",
    backgroundColor: "#FFF8E1",
    border: "1px solid #F5C518",
    borderRadius: 6,
    color: "#7A5C00",
    fontSize: 13,
    fontWeight: 700
  },
  evidenceGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10
  },
  evidenceItem: {
    backgroundColor: "#F7F4ED",
    border: "1px solid #E1DED5",
    borderRadius: 8,
    padding: 14
  },
  evidenceLabel: {
    margin: "0 0 6px",
    color: "#52616B",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase"
  },
  evidenceValue: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800
  },
  timeline: {
    marginTop: 14,
    display: "grid",
    gap: 8
  },
  timelineItem: {
    margin: 0,
    padding: "10px 12px",
    borderRadius: 6,
    backgroundColor: "#F5F7F8",
    color: "#36454F",
    fontWeight: 650
  },
  ollamaHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start"
  },
  localBadge: {
    border: "1px solid #2A7A4B",
    color: "#1A4D30",
    backgroundColor: "#D4F0E0",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap"
  },
  localBadgeOff: {
    border: "1px solid #B8C2CC",
    color: "#52616B",
    backgroundColor: "#F5F7F8",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap"
  },
  webcamRow: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    marginTop: 18,
    marginBottom: 18
  },
  webcamBox: {
    position: "relative",
    width: 200,
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1F2933",
    flexShrink: 0
  },
  webcamVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  webcamPlaceholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  webcamPlaceholderText: {
    margin: 0,
    color: "#7A8B94",
    fontSize: 13,
    fontWeight: 700
  },
  webcamControls: {
    flex: 1
  },
  webcamDesc: {
    margin: "6px 0 12px",
    fontSize: 14,
    color: "#52616B",
    lineHeight: 1.5
  }
};
