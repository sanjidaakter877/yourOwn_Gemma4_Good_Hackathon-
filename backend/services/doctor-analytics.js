/**
 * Doctor Dashboard Analytics Service
 * Provides predictive insights, risk scoring, behavioral heatmaps
 */

const fs = require('fs');
const path = require('path');

class DoctorAnalytics {
  constructor() {
    this.analyticsCache = {};
  }

  /**
   * Calculate overall risk score (0-100)
   * Factors: MMSE decline, alert frequency, medication adherence, behavioral changes
   */
  calculateRiskScore(patientData) {
    let riskScore = 0;

    // Factor 1: MMSE Progression (0-30 points)
    if (patientData.medicalHistory?.mmseScores?.length >= 2) {
      const scores = patientData.medicalHistory.mmseScores
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const declinePerMonth = this.calculateDeclineRate(scores);
      if (declinePerMonth > 1) {
        riskScore += Math.min(30, declinePerMonth * 10); // Fast decline = high risk
      }
    }

    // Factor 2: Recent Alert Frequency (0-25 points)
    if (patientData.alertHistory) {
      const recentAlerts = patientData.alertHistory.filter(
        a => new Date() - new Date(a.timestamp) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      );

      if (recentAlerts.length > 10) {
        riskScore += 25; // Many recent alerts
      } else if (recentAlerts.length > 5) {
        riskScore += 15;
      } else if (recentAlerts.length > 2) {
        riskScore += 8;
      }
    }

    // Factor 3: Medication Adherence (0-20 points)
    const adherenceRate = this.calculateMedicationAdherence(patientData);
    if (adherenceRate < 0.7) {
      riskScore += 20; // Poor adherence
    } else if (adherenceRate < 0.85) {
      riskScore += 10;
    }

    // Factor 4: Behavioral Changes (0-15 points)
    const behavioralRisk = this.assessBehavioralRisk(patientData);
    riskScore += behavioralRisk;

    // Factor 5: Critical Events (0-10 points)
    const criticalEvents = patientData.alertHistory?.filter(
      a => a.severity === 'CRITICAL'
    ).length || 0;
    riskScore += Math.min(10, criticalEvents * 3);

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Predict cognitive decline trajectory
   * Uses linear regression on MMSE scores
   */
  predictCognitiveDecline(patientData, monthsAhead = 3) {
    const scores = patientData.medicalHistory?.mmseScores || [];

    if (scores.length < 3) {
      return {
        predictedScore: null,
        confidence: 0,
        trajectory: 'insufficient_data',
        recommendation: 'Collect more data points',
      };
    }

    // Sort by date
    const sortedScores = scores
      .map(s => ({
        date: new Date(s.date),
        score: s.value,
      }))
      .sort((a, b) => a.date - b.date);

    // Linear regression
    const xValues = sortedScores.map((s, i) => i);
    const yValues = sortedScores.map(s => s.score);

    const { slope, intercept, rSquared } = this.linearRegression(xValues, yValues);

    // Predict future score
    const futureX = xValues.length + (monthsAhead / 3); // Assuming monthly data
    const predictedScore = slope * futureX + intercept;

    // Interpret trajectory
    let trajectory = 'stable';
    if (slope < -0.5) trajectory = 'rapid_decline';
    else if (slope < -0.2) trajectory = 'moderate_decline';
    else if (slope > 0.2) trajectory = 'improvement';

    const recommendation = this.getDeclineRecommendation(trajectory, predictedScore);

    return {
      currentScore: yValues[yValues.length - 1],
      predictedScore: Math.max(0, Math.min(30, predictedScore)),
      monthsAhead,
      trajectory,
      declinePerMonth: Math.abs(slope).toFixed(2),
      confidence: rSquared,
      recommendation,
    };
  }

  /**
   * Generate behavioral heatmap
   * Shows when/where issues typically occur
   */
  generateBehavioralHeatmap(patientData) {
    const heatmap = {
      hourly: {}, // Hour of day -> alert count
      daily: {},  // Day of week -> alert count
      location: {}, // Location -> alert count
      type: {}, // Alert type -> frequency
    };

    patientData.alertHistory?.forEach(alert => {
      const date = new Date(alert.timestamp);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Hourly pattern
      heatmap.hourly[hour] = (heatmap.hourly[hour] || 0) + 1;

      // Daily pattern
      heatmap.daily[day] = (heatmap.daily[day] || 0) + 1;

      // Location pattern
      if (alert.location) {
        heatmap.location[alert.location] = (heatmap.location[alert.location] || 0) + 1;
      }

      // Type pattern
      heatmap.type[alert.type] = (heatmap.type[alert.type] || 0) + 1;
    });

    // Convert to arrays for easier charting
    return {
      hourly: Object.entries(heatmap.hourly).map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
      })).sort((a, b) => a.hour - b.hour),
      
      daily: Object.entries(heatmap.daily).map(([day, count]) => ({
        day,
        count,
      })),
      
      location: Object.entries(heatmap.location)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count),
      
      type: Object.entries(heatmap.type)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  /**
   * Track medication effectiveness
   */
  analyzeMedicationEffectiveness(patientData) {
    const analysis = {
      medications: [],
      summary: '',
    };

    patientData.medicalHistory?.medications?.forEach(med => {
      // Simple heuristic: if MMSE is stable/improving and alerts are low, med is working
      const mmseScores = patientData.medicalHistory.mmseScores || [];
      const recentAlerts = (patientData.alertHistory || []).filter(
        a => new Date() - new Date(a.timestamp) < 30 * 24 * 60 * 60 * 1000
      );

      const effectiveness = {
        medication: med.name,
        dosage: med.dosage,
        startDate: med.startDate,
        effectiveness: 'moderate',
        evidence: [],
      };

      if (mmseScores.length > 1) {
        const latestScore = mmseScores[mmseScores.length - 1].value;
        const previousScore = mmseScores[mmseScores.length - 2].value;

        if (latestScore >= previousScore - 1) {
          effectiveness.effectiveness = 'good';
          effectiveness.evidence.push('MMSE score stable or improving');
        } else if (latestScore < previousScore - 3) {
          effectiveness.effectiveness = 'poor';
          effectiveness.evidence.push('MMSE score declining rapidly');
        }
      }

      if (recentAlerts.length < 3) {
        effectiveness.effectiveness = 'good';
        effectiveness.evidence.push('Few recent alerts');
      } else if (recentAlerts.length > 10) {
        effectiveness.effectiveness = 'poor';
        effectiveness.evidence.push('Many recent alerts');
      }

      analysis.medications.push(effectiveness);
    });

    // Overall summary
    const goodMeds = analysis.medications.filter(m => m.effectiveness === 'good').length;
    const poorMeds = analysis.medications.filter(m => m.effectiveness === 'poor').length;

    if (poorMeds > 0) {
      analysis.summary = `Consider reviewing ${poorMeds} medication(s) - effectiveness appears low`;
    } else if (goodMeds === analysis.medications.length) {
      analysis.summary = 'Current medication regimen appears effective';
    } else {
      analysis.summary = 'Current medication regimen shows mixed results';
    }

    return analysis;
  }

  /**
   * Alert pattern analysis
   */
  analyzeAlertPatterns(patientData) {
    const patterns = {
      mostCommonAlert: '',
      alertTrend: 'stable',
      highRiskTimes: [],
      recommendations: [],
    };

    if (!patientData.alertHistory || patientData.alertHistory.length === 0) {
      return patterns;
    }

    // Most common alert
    const alertCounts = {};
    patientData.alertHistory.forEach(alert => {
      alertCounts[alert.type] = (alertCounts[alert.type] || 0) + 1;
    });

    patterns.mostCommonAlert = Object.keys(alertCounts).reduce((a, b) =>
      alertCounts[a] > alertCounts[b] ? a : b
    );

    // Alert trend (last 7 days vs previous 7 days)
    const now = new Date();
    const week1Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const week2Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const week1Alerts = patientData.alertHistory.filter(
      a => new Date(a.timestamp) >= week1Start
    ).length;

    const week2Alerts = patientData.alertHistory.filter(
      a => new Date(a.timestamp) >= week2Start && new Date(a.timestamp) < week1Start
    ).length;

    if (week1Alerts > week2Alerts * 1.2) {
      patterns.alertTrend = 'increasing';
      patterns.recommendations.push('Alert frequency is increasing - review medication/environment');
    } else if (week1Alerts < week2Alerts * 0.8) {
      patterns.alertTrend = 'decreasing';
      patterns.recommendations.push('Alert frequency is decreasing - current interventions appear effective');
    }

    // High-risk times
    const hourCounts = {};
    patientData.alertHistory.forEach(alert => {
      const hour = new Date(alert.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    patterns.highRiskTimes = Object.entries(hourCounts)
      .filter(([_, count]) => count > 2)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        alertCount: count,
        timeOfDay: this.getTimeOfDayDescription(parseInt(hour)),
      }));

    return patterns;
  }

  /**
   * Generate comprehensive dashboard summary
   */
  generateDashboardSummary(patientData) {
    return {
      patient: {
        id: patientData.patientId,
        name: `${patientData.firstName} ${patientData.lastName}`,
        age: this.calculateAge(patientData.dateOfBirth),
        diagnosis: patientData.diagnosis,
      },
      riskAssessment: {
        score: this.calculateRiskScore(patientData),
        level: this.getRiskLevel(this.calculateRiskScore(patientData)),
      },
      cognitiveStatus: this.predictCognitiveDecline(patientData),
      recentAlerts: (patientData.alertHistory || [])
        .slice(-5)
        .reverse(),
      medicationAnalysis: this.analyzeMedicationEffectiveness(patientData),
      alertPatterns: this.analyzeAlertPatterns(patientData),
      behavioralHeatmap: this.generateBehavioralHeatmap(patientData),
      lastUpdated: new Date().toISOString(),
    };
  }

  // Helper methods

  calculateDeclineRate(scores) {
    if (scores.length < 2) return 0;

    let totalDecline = 0;
    const months = [];

    for (let i = 1; i < scores.length; i++) {
      totalDecline += scores[i - 1].value - scores[i].value;
      const monthDiff = this.getMonthsDifference(scores[i - 1].date, scores[i].date);
      months.push(monthDiff);
    }

    const avgMonths = months.reduce((a, b) => a + b, 0) / months.length;
    return avgMonths > 0 ? totalDecline / avgMonths : 0;
  }

  calculateMedicationAdherence(patientData) {
    if (!patientData.alertHistory) return 1.0;

    const medicationAlerts = patientData.alertHistory.filter(
      a => a.type === 'MEDICATION_ISSUE'
    ).length;

    const totalAlerts = patientData.alertHistory.length;
    return 1 - (medicationAlerts / totalAlerts);
  }

  assessBehavioralRisk(patientData) {
    let risk = 0;

    const distressAlerts = (patientData.alertHistory || []).filter(
      a => a.type === 'EMOTIONAL_DISTRESS'
    ).length;

    if (distressAlerts > 5) risk += 10;
    else if (distressAlerts > 2) risk += 5;

    const wanderingAlerts = (patientData.alertHistory || []).filter(
      a => a.type === 'WANDERING'
    ).length;

    if (wanderingAlerts > 10) risk += 5;

    return Math.min(15, risk);
  }

  linearRegression(xValues, yValues) {
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const yMean = sumY / n;
    const ssRes = yValues.reduce((sum, y, i) => {
      const predicted = slope * xValues[i] + intercept;
      return sum + (y - predicted) ** 2;
    }, 0);
    const ssTot = yValues.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
    const rSquared = 1 - (ssRes / ssTot);

    return { slope, intercept, rSquared };
  }

  getDeclineRecommendation(trajectory, score) {
    if (trajectory === 'rapid_decline') {
      return 'Rapid cognitive decline detected. Recommend urgent review and possible medication adjustment.';
    }
    if (trajectory === 'moderate_decline') {
      return 'Moderate cognitive decline. Continue current treatment and monitor closely.';
    }
    if (trajectory === 'stable') {
      return 'Cognitive status stable. Current treatment plan effective.';
    }
    if (trajectory === 'improvement') {
      return 'Cognitive improvement observed. Maintain current regimen.';
    }
    return 'Continue monitoring.';
  }

  getRiskLevel(score) {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MODERATE';
    return 'LOW';
  }

  getTimeOfDayDescription(hour) {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  }

  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getMonthsDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 +
           (d2.getMonth() - d1.getMonth());
  }
}

module.exports = DoctorAnalytics;
