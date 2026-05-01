const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { readCareEvents } = require("../services/memory");

/**
 * Doctor Dashboard API
 * Provides medical insights, patient progression, and alert management
 */

// Get patient summary for doctor view
router.get("/:patientId/summary", (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalProfilePath = path.join(
      __dirname,
      `../data/medical-profiles/${patientId}.json`
    );

    if (!fs.existsSync(medicalProfilePath)) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const profile = JSON.parse(fs.readFileSync(medicalProfilePath));

    // Return sanitized summary for doctor
    const summary = {
      patient: {
        id: profile.patientProfile.id,
        name: profile.patientProfile.name,
        age: profile.patientProfile.age,
        diagnosisType: profile.patientProfile.type,
        diagnosisDate: profile.patientProfile.diagnosisDate,
        currentStage: profile.patientProfile.currentStage
      },
      medical: {
        mmseScore: profile.medicalHistory.mmseScores[0],
        gdsStage: profile.medicalHistory.gdsStagingHistory[0],
        medications: profile.medicalHistory.medications,
        comorbidities: profile.medicalHistory.comorbidities,
        allergies: profile.medicalHistory.allergies
      },
      progression: profile.progressionAnalysis,
      recentAlerts: profile.alertHistory.alerts.slice(0, 5),
      lastUpdated: new Date().toISOString()
    };

    return res.json(summary);
  } catch (error) {
    console.error("❌ Doctor summary error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve patient summary" });
  }
});

// Get patient progression timeline
router.get("/:patientId/timeline", (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalProfilePath = path.join(
      __dirname,
      `../data/medical-profiles/${patientId}.json`
    );

    if (!fs.existsSync(medicalProfilePath)) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const profile = JSON.parse(fs.readFileSync(medicalProfilePath));

    const timeline = {
      mmseProgression: profile.medicalHistory.mmseScores.reverse(),
      gdsTrend: profile.medicalHistory.gdsStagingHistory.reverse(),
      behavioralEvents: profile.behavioralLog.entries.reverse(),
      medicationChanges: profile.medicalHistory.medications.map(m => ({
        medication: m.name,
        startDate: m.startDate,
        status: "Active"
      })),
      alerts: profile.alertHistory.alerts.reverse()
    };

    return res.json(timeline);
  } catch (error) {
    console.error("❌ Timeline error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve timeline" });
  }
});

// Get alert history
router.get("/:patientId/alerts", (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalProfilePath = path.join(
      __dirname,
      `../data/medical-profiles/${patientId}.json`
    );

    if (!fs.existsSync(medicalProfilePath)) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const profile = JSON.parse(fs.readFileSync(medicalProfilePath));

    // Group alerts by type and severity
    const alertAnalysis = {
      total: profile.alertHistory.alerts.length,
      byType: {},
      bySeverity: {},
      unresolvedCount: 0,
      recent: profile.alertHistory.alerts.slice(0, 20)
    };

    profile.alertHistory.alerts.forEach(alert => {
      if (alert.type) {
        alertAnalysis.byType[alert.type] = (alertAnalysis.byType[alert.type] || 0) + 1;
      }
      if (alert.severity) {
        alertAnalysis.bySeverity[alert.severity] =
          (alertAnalysis.bySeverity[alert.severity] || 0) + 1;
      }
      if (!alert.resolved) {
        alertAnalysis.unresolvedCount += 1;
      }
    });

    return res.json(alertAnalysis);
  } catch (error) {
    console.error("❌ Alerts error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve alerts" });
  }
});

// Get Gemma-generated care reasoning timeline
router.get("/:patientId/care-events", (req, res) => {
  try {
    const events = readCareEvents().slice(0, 40);
    return res.json({
      total: events.length,
      highRiskCount: events.filter((event) =>
        ["high", "emergency"].includes(event.risk?.level)
      ).length,
      recent: events
    });
  } catch (error) {
    console.error("Care events error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve care events" });
  }
});

// Get real-time severity trend from Gemma care events
router.get("/:patientId/severity-trend", (req, res) => {
  try {
    const events = readCareEvents().slice(0, 60);
    const scoredEvents = events
      .map((event) => ({
        timestamp: event.timestamp,
        transcript: event.transcript,
        episodeType: event.episode_type || event.behavior_analysis?.episode_type || "spoken_or_context",
        silentConfusion: Boolean(
          event.silent_confusion || event.behavior_analysis?.silent_confusion
        ),
        riskLevel: event.risk?.level || "unknown",
        score: Number(event.risk?.score ?? riskLevelToScore(event.risk?.level)),
        flags: event.risk?.flags || [],
        behaviorScore: Number(event.behavior_analysis?.score || 0)
      }))
      .filter((event) => Number.isFinite(event.score));

    const recent = scoredEvents.slice(0, 10);
    const previous = scoredEvents.slice(10, 20);
    const recentAverage = averageScore(recent);
    const previousAverage = averageScore(previous);
    const delta = Number((recentAverage - previousAverage).toFixed(2));

    let trend = "stable";
    if (scoredEvents.length < 4) trend = "collecting_baseline";
    else if (delta >= 0.08) trend = "worsening";
    else if (delta <= -0.08) trend = "improving";

    const silentRecent = recent.filter((event) => event.silentConfusion).length;
    const silentPrevious = previous.filter((event) => event.silentConfusion).length;
    const spokenOrientationRecent = recent.filter((event) =>
      event.flags.some((flag) =>
        ["disorientation", "possible_wandering", "repeated_orientation_support"].includes(flag)
      )
    ).length;
    const topRiskDrivers = summarizeFlags(recent);
    const doctorSummary = buildSeveritySummary({
      trend,
      delta,
      recentAverage,
      previousAverage,
      silentRecent,
      silentPrevious,
      highRiskRecent: recent.filter((event) =>
        ["high", "emergency"].includes(event.riskLevel)
      ).length,
      topRiskDrivers
    });

    return res.json({
      patientId: req.params.patientId,
      trend,
      recentAverage,
      previousAverage,
      delta,
      samples: scoredEvents.length,
      highRiskRecent: recent.filter((event) =>
        ["high", "emergency"].includes(event.riskLevel)
      ).length,
      silentConfusionRecent: silentRecent,
      silentConfusionPrevious: silentPrevious,
      spokenOrientationRecent,
      topRiskDrivers,
      doctorSummary,
      clinicalCaution:
        "Trend reports describe support signals only. They are not a diagnosis and should be reviewed by a clinician or caregiver.",
      recent
    });
  } catch (error) {
    console.error("Severity trend error:", error.message);
    return res.status(500).json({ error: "Failed to calculate severity trend" });
  }
});

// Get voice profile analytics
router.get("/:patientId/voice-profiles", (req, res) => {
  try {
    const { patientId } = req.params;
    const voiceProfilesPath = path.join(
      __dirname,
      `../data/voice-profiles/${patientId}`
    );

    if (!fs.existsSync(voiceProfilesPath)) {
      return res.json({ profiles: [] });
    }

    const profiles = fs.readdirSync(voiceProfilesPath)
      .filter(f => f.endsWith(".json"))
      .map(f => {
        const profile = JSON.parse(
          fs.readFileSync(path.join(voiceProfilesPath, f))
        );
        return {
          id: profile.id,
          name: profile.name,
          relationship: profile.relationship,
          sampleCount: profile.sampleCount,
          reliability: profile.reliability,
          lastUpdated: profile.lastUpdated
        };
      });

    return res.json({ profiles });
  } catch (error) {
    console.error("❌ Voice profiles error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve voice profiles" });
  }
});

// Get behavioral patterns
router.get("/:patientId/behavioral-patterns", (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalProfilePath = path.join(
      __dirname,
      `../data/medical-profiles/${patientId}.json`
    );

    if (!fs.existsSync(medicalProfilePath)) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const profile = JSON.parse(fs.readFileSync(medicalProfilePath));

    // Analyze behavioral patterns
    const patterns = {
      totalEntries: profile.behavioralLog.entries.length,
      byType: {},
      bySeverity: {},
      trends: {}
    };

    profile.behavioralLog.entries.forEach(entry => {
      patterns.byType[entry.type] = (patterns.byType[entry.type] || 0) + 1;
      patterns.bySeverity[entry.severity] = (patterns.bySeverity[entry.severity] || 0) + 1;
    });

    // Common patterns
    const sortedByType = Object.entries(patterns.byType).sort((a, b) => b[1] - a[1]);
    patterns.mostCommon = sortedByType.slice(0, 3).map(([type, count]) => ({
      type,
      frequency: count,
      percentage: ((count / patterns.totalEntries) * 100).toFixed(1) + "%"
    }));

    return res.json(patterns);
  } catch (error) {
    console.error("❌ Behavioral patterns error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve behavioral patterns" });
  }
});

// Get caregiver notes
router.get("/:patientId/caregiver-notes", (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalProfilePath = path.join(
      __dirname,
      `../data/medical-profiles/${patientId}.json`
    );

    if (!fs.existsSync(medicalProfilePath)) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const profile = JSON.parse(fs.readFileSync(medicalProfilePath));

    return res.json({
      observations: profile.caregiverObservations.observations.reverse().slice(0, 30),
      doctorNotes: profile.doctorNotes.notes.reverse()
    });
  } catch (error) {
    console.error("❌ Caregiver notes error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve notes" });
  }
});

// Add doctor note
router.post("/:patientId/doctor-note", (req, res) => {
  try {
    const { patientId } = req.params;
    const { doctorId, note, observations } = req.body;

    if (!note) {
      return res.status(400).json({ error: "Note is required" });
    }

    const medicalProfilePath = path.join(
      __dirname,
      `../data/medical-profiles/${patientId}.json`
    );

    if (!fs.existsSync(medicalProfilePath)) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const profile = JSON.parse(fs.readFileSync(medicalProfilePath));

    const newNote = {
      date: new Date().toISOString().split("T")[0],
      doctorId: doctorId || "doctor_unknown",
      note,
      observations: observations || []
    };

    profile.doctorNotes.notes.push(newNote);
    fs.writeFileSync(medicalProfilePath, JSON.stringify(profile, null, 2));

    return res.json({ message: "Note added successfully", note: newNote });
  } catch (error) {
    console.error("❌ Doctor note error:", error.message);
    return res.status(500).json({ error: "Failed to add doctor note" });
  }
});

module.exports = router;

function riskLevelToScore(level) {
  if (level === "emergency") return 0.9;
  if (level === "high") return 0.7;
  if (level === "medium") return 0.45;
  if (level === "low") return 0.18;
  return 0.25;
}

function averageScore(events) {
  if (!events.length) return 0;
  const total = events.reduce((sum, event) => sum + event.score, 0);
  return Number((total / events.length).toFixed(2));
}

function summarizeFlags(events) {
  const counts = {};
  events.forEach((event) => {
    event.flags.forEach((flag) => {
      counts[flag] = (counts[flag] || 0) + 1;
    });
    if (event.silentConfusion) {
      counts.silent_confusion = (counts.silent_confusion || 0) + 1;
    }
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([flag, count]) => ({ flag, count }));
}

function buildSeveritySummary({
  trend,
  delta,
  recentAverage,
  previousAverage,
  silentRecent,
  silentPrevious,
  highRiskRecent,
  topRiskDrivers
}) {
  const driverText = topRiskDrivers.length
    ? topRiskDrivers.map((item) => `${item.flag} (${item.count})`).join(", ")
    : "no dominant driver yet";

  return [
    `Trend is ${trend}.`,
    `Recent average risk is ${recentAverage}, compared with ${previousAverage} before (delta ${delta}).`,
    `Silent confusion moments changed from ${silentPrevious} to ${silentRecent} in the recent window.`,
    `Recent high-risk moments: ${highRiskRecent}.`,
    `Main support signals: ${driverText}.`
  ].join(" ");
}
