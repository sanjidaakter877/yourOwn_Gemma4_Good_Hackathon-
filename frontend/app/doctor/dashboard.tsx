"use client";

import React, { CSSProperties, useState, useEffect } from 'react';
import { apiUrl } from '../../lib/api';

type Medication = {
  name: string;
  dosage: string;
  frequency: string;
};

type PatientSummary = {
  patient?: {
    name?: string;
    age?: number;
    diagnosisType?: string;
  };
  medical?: {
    gdsStage?: { stage?: string };
    mmseScore?: {
      score: number;
      date: string;
      stage: string;
    };
    medications?: Medication[];
  };
};

type AlertItem = {
  type: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW" | string;
  timestamp: string;
};

type AlertSummary = {
  bySeverity?: Record<string, number>;
  recent?: AlertItem[];
};

type CareEvent = {
  id: string;
  timestamp: string;
  transcript: string;
  risk?: {
    level: string;
    score: number;
    flags: string[];
  };
  evidence?: string[];
  action_plan?: {
    caregiver_action?: string;
    doctor_action?: string;
  };
  verification?: {
    safe_to_send: boolean;
    grounding_score: number;
  };
};

type CareTimeline = {
  total: number;
  highRiskCount: number;
  recent: CareEvent[];
};

export default function DoctorDashboard() {
  const [patientSummary, setPatientSummary] = useState<PatientSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertSummary | null>(null);
  const [careTimeline, setCareTimeline] = useState<CareTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [doctorNote, setDoctorNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, alertsRes, careEventsRes] = await Promise.all([
          fetch(apiUrl('/doctor/patient_001/summary')).then(r => r.json()),
          fetch(apiUrl('/doctor/patient_001/alerts')).then(r => r.json()),
          fetch(apiUrl('/doctor/patient_001/care-events')).then(r => r.json())
        ]);

        setPatientSummary(summaryRes);
        setAlerts(alertsRes);
        setCareTimeline(careEventsRes);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddNote = async () => {
    if (!doctorNote.trim()) return;

    try {
      await fetch(apiUrl('/doctor/patient_001/doctor-note'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: 'doctor_001',
          note: doctorNote,
          observations: []
        })
      });

      setDoctorNote('');
      alert('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  if (loading) {
    return <div style={styles.container}><p>Loading...</p></div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Doctor Dashboard</h1>
        <p>Patient Progression & Alerts</p>
      </header>

      <main style={styles.main}>
        {/* Patient Summary */}
        {patientSummary && (
          <section style={styles.card}>
            <h2>Patient Summary</h2>
            <div style={styles.grid}>
              <div style={styles.statBox}>
                <p style={styles.label}>Name</p>
                <p style={styles.value}>{patientSummary.patient?.name || 'N/A'}</p>
              </div>
              <div style={styles.statBox}>
                <p style={styles.label}>Age</p>
                <p style={styles.value}>{patientSummary.patient?.age || 'N/A'}</p>
              </div>
              <div style={styles.statBox}>
                <p style={styles.label}>Diagnosis</p>
                <p style={styles.value}>{patientSummary.patient?.diagnosisType || 'N/A'}</p>
              </div>
              <div style={styles.statBox}>
                <p style={styles.label}>Current Stage</p>
                <p style={styles.value}>{patientSummary.medical?.gdsStage?.stage || 'N/A'}</p>
              </div>
            </div>
          </section>
        )}

        {/* MMSE Score */}
        {patientSummary?.medical?.mmseScore && (
          <section style={styles.card}>
            <h2>Cognitive Assessment (MMSE)</h2>
            <div style={styles.scoreBox}>
              <p style={styles.scoreLabel}>Current Score</p>
              <p style={styles.scoreValue}>
                {patientSummary.medical.mmseScore.score}/30
              </p>
              <p style={styles.scoreDate}>
                Date: {new Date(patientSummary.medical.mmseScore.date).toLocaleDateString()}
              </p>
              <p style={styles.stageInfo}>
                Stage: <strong>{patientSummary.medical.mmseScore.stage}</strong>
              </p>
            </div>
          </section>
        )}

        {/* Current Medications */}
        {patientSummary?.medical?.medications && (
          <section style={styles.card}>
            <h2>💊 Current Medications</h2>
            {patientSummary.medical.medications.map((med, idx) => (
              <div key={idx} style={styles.medicationBox}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                  {med.name}
                </p>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  {med.dosage} - {med.frequency}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Alert Statistics */}
        {alerts && (
          <section style={styles.card}>
            <h2>Alert Summary</h2>
            <div style={styles.alertStatsGrid}>
              <div style={{ ...styles.alertStat, borderColor: '#ff6b6b' }}>
                <p style={styles.alertCount}>{alerts.bySeverity?.HIGH || 0}</p>
                <p style={styles.alertLabel}>High Severity</p>
              </div>
              <div style={{ ...styles.alertStat, borderColor: '#ffc107' }}>
                <p style={styles.alertCount}>{alerts.bySeverity?.MEDIUM || 0}</p>
                <p style={styles.alertLabel}>Medium</p>
              </div>
              <div style={{ ...styles.alertStat, borderColor: '#27AE60' }}>
                <p style={styles.alertCount}>{alerts.bySeverity?.LOW || 0}</p>
                <p style={styles.alertLabel}>Low</p>
              </div>
            </div>

            {alerts.recent && alerts.recent.length > 0 && (
              <>
                <h3 style={{ marginTop: '20px' }}>Recent Alerts</h3>
                {alerts.recent.slice(0, 5).map((alert, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.recentAlertBox,
                      borderColor: alert.severity === 'HIGH' ? '#ff6b6b' : 
                                   alert.severity === 'MEDIUM' ? '#ffc107' : '#27AE60'
                    }}
                  >
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                      {alert.type}
                    </p>
                    <p style={{ margin: '0', color: '#555', fontSize: '14px' }}>
                      {alert.description}
                    </p>
                    <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '12px' }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </>
            )}
          </section>
        )}

        {careTimeline && (
          <section style={styles.card}>
            <h2>Gemma Care Reasoning Timeline</h2>
            <div style={styles.alertStatsGrid}>
              <div style={{ ...styles.alertStat, borderColor: '#9C27B0' }}>
                <p style={styles.alertCount}>{careTimeline.total}</p>
                <p style={styles.alertLabel}>Reasoned Events</p>
              </div>
              <div style={{ ...styles.alertStat, borderColor: '#ff6b6b' }}>
                <p style={styles.alertCount}>{careTimeline.highRiskCount}</p>
                <p style={styles.alertLabel}>High Risk</p>
              </div>
              <div style={{ ...styles.alertStat, borderColor: '#27AE60' }}>
                <p style={styles.alertCount}>
                  {careTimeline.recent[0]?.verification?.safe_to_send ? '✓' : '—'}
                </p>
                <p style={styles.alertLabel}>Latest Verified</p>
              </div>
            </div>

            {careTimeline.recent.slice(0, 5).map((event) => (
              <div key={event.id} style={styles.careEventBox}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                  {event.risk?.level?.toUpperCase() || 'LOW'} risk ·{' '}
                  {new Date(event.timestamp).toLocaleString()}
                </p>
                <p style={{ margin: '0 0 8px 0', color: '#555', fontSize: '14px' }}>
                  {event.transcript || 'No transcript'}
                </p>
                <p style={{ margin: '0', color: '#333', fontSize: '13px' }}>
                  {event.action_plan?.doctor_action || 'No doctor action needed.'}
                </p>
                {(event.evidence || []).slice(0, 3).map((item, index) => (
                  <p key={index} style={styles.evidenceLine}>• {item}</p>
                ))}
              </div>
            ))}
          </section>
        )}

        {/* Doctor Notes */}
        <section style={styles.card}>
          <h2>📝 Add Clinical Note</h2>
          <textarea
            value={doctorNote}
            onChange={(e) => setDoctorNote(e.target.value)}
            placeholder="Enter clinical observations..."
            style={styles.textarea}
          />
          <button
            onClick={handleAddNote}
            style={styles.noteButton}
          >
            Save Note
          </button>
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center'
  },
  main: {
    maxWidth: '900px',
    margin: '20px auto',
    padding: '0 20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px'
  },
  statBox: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  label: {
    margin: '0',
    fontSize: '12px',
    color: '#999',
    textTransform: 'uppercase'
  },
  value: {
    margin: '8px 0 0 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  scoreBox: {
    padding: '20px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    textAlign: 'center'
  },
  scoreLabel: {
    margin: '0',
    color: '#666',
    fontSize: '14px'
  },
  scoreValue: {
    margin: '10px 0 0 0',
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#2196F3'
  },
  scoreDate: {
    margin: '10px 0 0 0',
    fontSize: '12px',
    color: '#999'
  },
  stageInfo: {
    margin: '10px 0 0 0',
    fontSize: '14px',
    color: '#333'
  },
  medicationBox: {
    padding: '12px',
    marginBottom: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '6px',
    borderLeft: '4px solid #9C27B0'
  },
  alertStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px'
  },
  alertStat: {
    padding: '15px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    borderLeft: '4px solid'
  },
  alertCount: {
    margin: '0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
  },
  alertLabel: {
    margin: '5px 0 0 0',
    fontSize: '12px',
    color: '#999'
  },
  recentAlertBox: {
    padding: '12px',
    marginBottom: '10px',
    backgroundColor: '#fafafa',
    borderRadius: '6px',
    borderLeft: '4px solid'
  },
  careEventBox: {
    padding: '14px',
    marginTop: '12px',
    backgroundColor: '#f8f6ff',
    borderRadius: '8px',
    borderLeft: '4px solid #9C27B0'
  },
  evidenceLine: {
    margin: '6px 0 0 0',
    color: '#666',
    fontSize: '12px'
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  noteButton: {
    marginTop: '10px',
    padding: '12px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};
