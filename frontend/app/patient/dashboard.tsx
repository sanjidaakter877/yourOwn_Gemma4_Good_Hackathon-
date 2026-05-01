"use client";

import React, { CSSProperties, useState } from 'react';
import { apiUrl } from '../../lib/api';

type AlertItem = {
  type: string;
  description: string;
};

export default function PatientDashboard() {
  const [isListening, setIsListening] = useState(false);
  const [response, setResponse] = useState('');
  const [recognizedPerson, setRecognizedPerson] = useState('');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulate voice input
  const handleVoiceInput = async () => {
    setLoading(true);
    setIsListening(true);

    try {
      // Simulate recording & sending to backend
      const mockResponse = await fetch(apiUrl('/assist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I cannot remember my daughter\'s name',
          patientId: 'patient_001'
        })
      }).then(r => r.json());

      setResponse(mockResponse.response?.reassurance || 'I am here to help you.');
      setRecognizedPerson('Sarah (Your Daughter)');

      // Fetch recent alerts
      const alertResponse = await fetch(apiUrl('/doctor/patient_001/alerts'))
        .then(r => r.json());
      
      setAlerts(alertResponse.recent?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Connection issue. Please try again.');
    } finally {
      setLoading(false);
      setIsListening(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>yourOwn</h1>
        <p>Your AI Companion</p>
      </header>

      <main style={styles.main}>
        {/* Voice Interaction Section */}
        <section style={styles.card}>
          <h2>Talk to Me</h2>
          <button
            onClick={handleVoiceInput}
            disabled={loading}
            style={{
              ...styles.button,
              backgroundColor: isListening ? '#ff6b6b' : '#4ECDC4',
              opacity: loading ? 0.6 : 1
            }}
          >
            {isListening ? '🎤 Listening...' : '🎤 Tap to Speak'}
          </button>
          
          {recognizedPerson && (
            <div style={styles.recognitionBox}>
              <p style={styles.recognitionText}>
                ✓ Recognized: <strong>{recognizedPerson}</strong>
              </p>
            </div>
          )}

          {response && (
            <div style={styles.responseBox}>
              <p style={styles.responseText}>{response}</p>
            </div>
          )}
        </section>

        {/* Location Status */}
        <section style={styles.card}>
          <h2>📍 Location</h2>
          <div style={styles.statusBox}>
            <p style={{ color: '#27AE60', fontSize: '16px' }}>
              ✓ Safe at Home
            </p>
            <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
              Last updated: 2 min ago
            </p>
          </div>
        </section>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <section style={styles.card}>
            <h2>⚠️ Recent Alerts</h2>
            {alerts.map((alert, idx) => (
              <div key={idx} style={styles.alertBox}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                  {alert.type}
                </p>
                <p style={{ margin: '0', color: '#555', fontSize: '14px' }}>
                  {alert.description}
                </p>
              </div>
            ))}
          </section>
        )}
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
    backgroundColor: '#4ECDC4',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center'
  },
  main: {
    maxWidth: '500px',
    margin: '20px auto',
    padding: '0 20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  button: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  recognitionBox: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#e8f8f5',
    borderRadius: '6px',
    borderLeft: '4px solid #27AE60'
  },
  recognitionText: {
    margin: '0',
    color: '#27AE60',
    fontSize: '14px'
  },
  responseBox: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
    borderLeft: '4px solid #2196F3'
  },
  responseText: {
    margin: '0',
    color: '#1565c0',
    fontSize: '15px',
    lineHeight: '1.5'
  },
  statusBox: {
    padding: '15px',
    backgroundColor: '#f0f0f0',
    borderRadius: '6px'
  },
  alertBox: {
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#fff3cd',
    borderLeft: '4px solid #ffc107',
    borderRadius: '4px'
  }
};
