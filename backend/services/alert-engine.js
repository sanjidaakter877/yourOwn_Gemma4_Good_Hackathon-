const fs = require("fs");
const path = require("path");

/**
 * Alert Engine for Alzheimer's Patient Care
 * Monitors: Wandering, medication adherence, behavioral changes, vital signs
 */
class AlertEngine {
  constructor() {
    this.alertsDir = path.join(__dirname, "../data/alerts");
    this.initializeStorage();
    this.riskThresholds = {
      wandering: {
        maxDistance: 2, // km from home
        timeThreshold: 30 // minutes
      },
      medicationMissed: {
        threshold: 30 // minutes past scheduled time
      },
      confusionSpike: {
        threshold: 0.6 // confidence score
      },
      emotionalDistress: {
        voiceAnxiety: 0.7, // emotional score threshold
        repetitiveQuestions: 3 // within 5 minutes
      }
    };
  }

  initializeStorage() {
    if (!fs.existsSync(this.alertsDir)) {
      fs.mkdirSync(this.alertsDir, { recursive: true });
    }
  }

  /**
   * Detect wandering based on GPS data
   */
  detectWandering(patientId, currentLocation, homeLocation) {
    const distance = this.calculateDistance(currentLocation, homeLocation);
    const timestamp = Date.now();

    if (distance > this.riskThresholds.wandering.maxDistance) {
      return {
        type: "WANDERING",
        severity: "HIGH",
        distance,
        description: `Patient is ${distance.toFixed(2)} km from home`,
        recommendation: "Contact caregiver immediately",
        timestamp
      };
    }

    return null;
  }

  /**
   * Calculate distance between two GPS points (Haversine formula)
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const lat1 = point1.lat * (Math.PI / 180);
    const lat2 = point2.lat * (Math.PI / 180);
    const deltaLat = (point2.lat - point1.lat) * (Math.PI / 180);
    const deltaLon = (point2.lon - point1.lon) * (Math.PI / 180);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Detect medication non-adherence
   */
  detectMedicationIssue(medication, scheduledTime) {
    const now = Date.now();
    const timeDiff = (now - scheduledTime) / (1000 * 60); // minutes

    if (timeDiff > this.riskThresholds.medicationMissed.threshold) {
      return {
        type: "MEDICATION_MISSED",
        severity: "MEDIUM",
        medication: medication.name,
        hoursLate: (timeDiff / 60).toFixed(1),
        description: `${medication.name} was not taken at scheduled time`,
        recommendation: `Administer ${medication.name} ${medication.dosage} now`,
        timestamp: Date.now()
      };
    }

    return null;
  }

  /**
   * Detect confusion patterns
   */
  detectConfusionSpike(conversationAnalysis, patientBaseline) {
    const confusionScore = conversationAnalysis.confusionLevel || 0;
    const baselineConfusion = patientBaseline.averageConfusionLevel || 0.3;

    // Alert if confusion is significantly higher than baseline
    if (confusionScore > baselineConfusion + 0.4) {
      return {
        type: "CONFUSION_SPIKE",
        severity: "MEDIUM",
        score: confusionScore.toFixed(2),
        baseline: baselineConfusion.toFixed(2),
        increase: ((confusionScore - baselineConfusion) * 100).toFixed(0) + "%",
        description: "Unusual increase in confusion detected",
        possibleCauses: [
          "Medication issue",
          "Sleep deprivation",
          "Infection or illness",
          "Environmental stressor"
        ],
        recommendation: "Monitor closely and consider medical evaluation",
        timestamp: Date.now()
      };
    }

    return null;
  }

  /**
   * Detect emotional distress from voice analysis
   */
  detectEmotionalDistress(voiceAnalysis) {
    const distressScore = voiceAnalysis.anxietyLevel || 0;

    if (distressScore > this.riskThresholds.emotionalDistress.voiceAnxiety) {
      return {
        type: "EMOTIONAL_DISTRESS",
        severity: "MEDIUM",
        anxietyLevel: distressScore.toFixed(2),
        description: "Patient showing signs of anxiety or distress",
        emotionalMarkers: voiceAnalysis.markers || [],
        recommendation: "Provide reassurance and check for physical discomfort",
        timestamp: Date.now()
      };
    }

    return null;
  }

  /**
   * Detect repetitive questioning pattern
   */
  detectRepetitiveQuestioning(recentConversations) {
    if (recentConversations.length < 3) {
      return null;
    }

    // Look for the same question asked multiple times
    const questions = recentConversations.map(c => c.question);
    const questionCounts = {};

    questions.forEach(q => {
      const normalized = this.normalizeQuestion(q);
      questionCounts[normalized] = (questionCounts[normalized] || 0) + 1;
    });

    const repetitions = Object.entries(questionCounts)
      .filter(([_, count]) => count >= this.riskThresholds.emotionalDistress.repetitiveQuestions);

    if (repetitions.length > 0) {
      return {
        type: "REPETITIVE_QUESTIONING",
        severity: "LOW",
        pattern: repetitions[0][0],
        occurrences: repetitions[0][1],
        description: "Patient asking the same question repeatedly",
        recommendation: "Provide consistent, reassuring answers",
        timestamp: Date.now()
      };
    }

    return null;
  }

  normalizeQuestion(question) {
    return question.toLowerCase().replace(/[^\w\s]/g, "").trim().substring(0, 50);
  }

  /**
   * Generate alert and store it
   */
  createAlert(patientId, alert) {
    const alertId = `alert_${Date.now()}`;
    const fullAlert = {
      id: alertId,
      patientId,
      ...alert,
      resolved: false,
      resolutionTime: null,
      caregiverNotified: false,
      doctorNotified: false
    };

    try {
      const patientAlertDir = path.join(this.alertsDir, patientId);
      if (!fs.existsSync(patientAlertDir)) {
        fs.mkdirSync(patientAlertDir, { recursive: true });
      }

      const filePath = path.join(patientAlertDir, `${alertId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(fullAlert, null, 2));

      console.log(`🚨 Alert created: ${alert.type} (${alert.severity})`);
      return fullAlert;
    } catch (error) {
      console.error("❌ Failed to create alert:", error.message);
      return null;
    }
  }

  /**
   * Get recent alerts for patient
   */
  getPatientAlerts(patientId, hours = 24) {
    try {
      const patientAlertDir = path.join(this.alertsDir, patientId);
      if (!fs.existsSync(patientAlertDir)) {
        return [];
      }

      const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
      const alerts = fs.readdirSync(patientAlertDir)
        .filter(f => f.endsWith(".json"))
        .map(f => JSON.parse(fs.readFileSync(path.join(patientAlertDir, f))))
        .filter(alert => alert.timestamp > cutoffTime);

      return alerts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("❌ Failed to get alerts:", error.message);
      return [];
    }
  }

  /**
   * Mark alert as resolved
   */
  resolveAlert(patientId, alertId) {
    try {
      const alertPath = path.join(this.alertsDir, patientId, `${alertId}.json`);
      if (!fs.existsSync(alertPath)) {
        return null;
      }

      const alert = JSON.parse(fs.readFileSync(alertPath));
      alert.resolved = true;
      alert.resolutionTime = Date.now();

      fs.writeFileSync(alertPath, JSON.stringify(alert, null, 2));
      console.log(`✅ Alert resolved: ${alertId}`);
      return alert;
    } catch (error) {
      console.error("❌ Failed to resolve alert:", error.message);
      return null;
    }
  }

  /**
   * Analyze overall alert patterns
   */
  getAlertTrends(patientId, days = 7) {
    try {
      const alerts = this.getPatientAlerts(patientId, days * 24);

      const trends = {
        totalAlerts: alerts.length,
        byType: {},
        bySeverity: {},
        trend: "stable"
      };

      alerts.forEach(alert => {
        trends.byType[alert.type] = (trends.byType[alert.type] || 0) + 1;
        trends.bySeverity[alert.severity] = (trends.bySeverity[alert.severity] || 0) + 1;
      });

      // Determine trend
      const recentAlerts = alerts.slice(0, Math.ceil(alerts.length / 2)).length;
      const olderAlerts = alerts.slice(Math.ceil(alerts.length / 2)).length;

      if (recentAlerts > olderAlerts * 1.3) {
        trends.trend = "increasing";
      } else if (recentAlerts < olderAlerts * 0.7) {
        trends.trend = "decreasing";
      }

      return trends;
    } catch (error) {
      console.error("❌ Failed to analyze alert trends:", error.message);
      return null;
    }
  }
}

module.exports = new AlertEngine();
