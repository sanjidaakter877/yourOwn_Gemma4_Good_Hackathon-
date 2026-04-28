/**
 * Advanced Alert Engine with Machine Learning
 * Learns patient behavior patterns, reduces false positives, adapts thresholds
 */

const fs = require('fs');
const path = require('path');

class AdvancedAlertML {
  constructor() {
    this.behavioralPatterns = {}; // Store learned patterns per patient
    this.modelPath = 'data/ml-models';
    this.minDataPoints = 20; // Minimum observations before ML kicks in
  }

  /**
   * Initialize behavioral model for patient
   */
  initializePatientModel(patientId) {
    if (!this.behavioralPatterns[patientId]) {
      this.behavioralPatterns[patientId] = {
        patientId,
        createdAt: new Date().toISOString(),
        hourlyPatterns: {}, // Hour -> average activity
        dailyPatterns: {}, // Day of week -> patterns
        locationPatterns: {}, // Location -> frequency
        alertHistory: [],
        falsePositives: 0,
        truePositives: 0,
        adaptiveThresholds: {
          wanderingGeofence: 2000, // meters
          confusionSpike: 0.6,
          repetitionThreshold: 5, // questions in 10 min
          medicationWindow: 30, // minutes
        },
      };
    }
    return this.behavioralPatterns[patientId];
  }

  /**
   * Learn from historical data
   * Extracts patterns from past behavior
   */
  async learnBehavioralPatterns(patientId, historicalData) {
    const model = this.initializePatientModel(patientId);

    if (!historicalData || historicalData.length < this.minDataPoints) {
      console.log(`[AdvancedAlertML] Insufficient data (${historicalData?.length || 0}/${this.minDataPoints})`);
      return model;
    }

    console.log(`[AdvancedAlertML] Learning patterns from ${historicalData.length} observations...`);

    // Extract hourly patterns
    historicalData.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      if (!model.hourlyPatterns[hour]) {
        model.hourlyPatterns[hour] = {
          count: 0,
          avgConfusion: 0,
          avgWandering: 0,
          avgDistress: 0,
        };
      }

      const hp = model.hourlyPatterns[hour];
      hp.count += 1;
      hp.avgConfusion = (hp.avgConfusion * (hp.count - 1) + (entry.confusionLevel || 0)) / hp.count;
      hp.avgWandering = (hp.avgWandering * (hp.count - 1) + (entry.wanderingFlag ? 1 : 0)) / hp.count;
      hp.avgDistress = (hp.avgDistress * (hp.count - 1) + (entry.distressLevel || 0)) / hp.count;
    });

    // Extract daily patterns
    historicalData.forEach(entry => {
      const day = new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      if (!model.dailyPatterns[day]) {
        model.dailyPatterns[day] = {
          count: 0,
          avgActivity: 0,
          alertCount: 0,
        };
      }

      const dp = model.dailyPatterns[day];
      dp.count += 1;
      dp.avgActivity = (dp.avgActivity * (dp.count - 1) + (entry.activityLevel || 0)) / dp.count;
      dp.alertCount += entry.alerts?.length || 0;
    });

    // Extract location patterns
    if (historicalData[0]?.location) {
      historicalData.forEach(entry => {
        const loc = entry.location;
        if (!model.locationPatterns[loc]) {
          model.locationPatterns[loc] = 0;
        }
        model.locationPatterns[loc] += 1;
      });
    }

    await this.saveModel(patientId, model);
    return model;
  }

  /**
   * Predict if alert is likely true positive
   * Returns: { isLikelyValid: boolean, confidence: 0-1, reason: string }
   */
  async predictAlertValidity(patientId, alertData) {
    const model = this.behavioralPatterns[patientId];

    if (!model) {
      return { isLikelyValid: true, confidence: 0.5, reason: 'No historical data' };
    }

    const prediction = {
      isLikelyValid: true,
      confidence: 0.5,
      reasons: [],
    };

    // Check if alert type is common at this hour
    const hour = new Date(alertData.timestamp).getHours();
    const hourlyPattern = model.hourlyPatterns[hour];

    if (hourlyPattern) {
      if (alertData.type === 'WANDERING' && hourlyPattern.avgWandering > 0.5) {
        prediction.confidence += 0.2;
        prediction.reasons.push('Patient often wanders at this hour');
      }

      if (alertData.type === 'CONFUSION' && hourlyPattern.avgConfusion > 0.4) {
        prediction.confidence -= 0.2; // Lower priority if common
        prediction.reasons.push('Patient frequently shows confusion at this time');
      }

      if (alertData.type === 'DISTRESS' && hourlyPattern.avgDistress > 0.3) {
        prediction.confidence -= 0.15;
        prediction.reasons.push('Patient often shows mild distress at this hour');
      }
    }

    // Check daily pattern
    const day = new Date(alertData.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    const dailyPattern = model.dailyPatterns[day];

    if (dailyPattern && dailyPattern.alertCount > 5) {
      prediction.confidence += 0.1;
      prediction.reasons.push(`${day}s typically have more alerts`);
    }

    // Check location
    if (alertData.location && model.locationPatterns[alertData.location] > 10) {
      prediction.confidence += 0.15;
      prediction.reasons.push('Patient frequently at this location');
    }

    // Anomaly detection: Is this very different from normal?
    if (alertData.severity === 'CRITICAL') {
      prediction.confidence = Math.min(0.95, prediction.confidence + 0.3);
      prediction.isLikelyValid = true;
      prediction.reasons.push('Critical severity - high priority regardless');
    }

    prediction.confidence = Math.max(0.1, Math.min(0.95, prediction.confidence));

    return prediction;
  }

  /**
   * Adapt alert thresholds based on feedback
   * Call when doctor confirms/dismisses alerts
   */
  async adaptThresholds(patientId, alertId, wasValid) {
    const model = this.initializePatientModel(patientId);

    if (wasValid) {
      model.truePositives += 1;
    } else {
      model.falsePositives += 1;
    }

    const falsePositiveRate = model.falsePositives / (model.truePositives + model.falsePositives);

    // If too many false positives (>40%), increase thresholds
    if (falsePositiveRate > 0.4) {
      console.log(`[AdvancedAlertML] High false positive rate (${(falsePositiveRate * 100).toFixed(1)}%)`);
      console.log('  → Increasing thresholds to reduce noise');

      model.adaptiveThresholds.wanderingGeofence *= 1.1; // 10% increase
      model.adaptiveThresholds.confusionSpike += 0.05;
      model.adaptiveThresholds.repetitionThreshold += 1;
      model.adaptiveThresholds.medicationWindow += 5;
    }

    // If too few alerts relative to known baseline, decrease thresholds
    if (falsePositiveRate < 0.1 && model.truePositives > 10) {
      console.log(`[AdvancedAlertML] Low false positive rate (${(falsePositiveRate * 100).toFixed(1)}%)`);
      console.log('  → Decreasing thresholds to catch more issues');

      model.adaptiveThresholds.wanderingGeofence *= 0.95; // 5% decrease
      model.adaptiveThresholds.confusionSpike = Math.max(0.3, model.adaptiveThresholds.confusionSpike - 0.05);
      model.adaptiveThresholds.repetitionThreshold = Math.max(3, model.adaptiveThresholds.repetitionThreshold - 1);
    }

    await this.saveModel(patientId, model);
    return model.adaptiveThresholds;
  }

  /**
   * Detect anomalies using statistical methods
   * Returns: { isAnomaly: boolean, zScore: number, type: string }
   */
  detectAnomaly(patientId, metric, value) {
    const model = this.behavioralPatterns[patientId];

    if (!model) {
      return { isAnomaly: false, zScore: 0, reason: 'No baseline' };
    }

    const detection = {
      isAnomaly: false,
      zScore: 0,
      reason: '',
    };

    // Calculate mean and standard deviation from hourly patterns
    const hour = new Date().getHours();
    const hourlyPattern = model.hourlyPatterns[hour];

    if (!hourlyPattern) {
      return detection;
    }

    let mean, stdDev, threshold;

    switch (metric) {
      case 'confusion':
        mean = hourlyPattern.avgConfusion;
        // Assume stdDev is 20% of mean (simplified)
        stdDev = mean * 0.2 || 0.1;
        threshold = 2.5; // Z-score threshold for anomaly
        detection.zScore = (value - mean) / (stdDev || 1);
        if (Math.abs(detection.zScore) > threshold) {
          detection.isAnomaly = true;
          detection.reason = `Confusion level ${(value * 100).toFixed(0)}% (vs avg ${(mean * 100).toFixed(0)}% at this hour)`;
        }
        break;

      case 'wandering':
        mean = hourlyPattern.avgWandering;
        stdDev = mean * 0.3 || 0.1;
        threshold = 2.0;
        detection.zScore = (value - mean) / (stdDev || 1);
        if (detection.zScore > threshold) {
          detection.isAnomaly = true;
          detection.reason = 'Unusual wandering activity for this time';
        }
        break;

      case 'distress':
        mean = hourlyPattern.avgDistress;
        stdDev = mean * 0.25 || 0.1;
        threshold = 2.5;
        detection.zScore = (value - mean) / (stdDev || 1);
        if (detection.zScore > threshold) {
          detection.isAnomaly = true;
          detection.reason = `Distress spike ${(value * 100).toFixed(0)}% (unusual for this hour)`;
        }
        break;
    }

    return detection;
  }

  /**
   * Get current adaptive thresholds
   */
  getAdaptiveThresholds(patientId) {
    const model = this.initializePatientModel(patientId);
    return model.adaptiveThresholds;
  }

  /**
   * Get model statistics
   */
  getModelStats(patientId) {
    const model = this.behavioralPatterns[patientId];

    if (!model) {
      return null;
    }

    return {
      patientId,
      createdAt: model.createdAt,
      dataPoints: Object.values(model.hourlyPatterns).reduce((sum, hp) => sum + hp.count, 0),
      hoursLearned: Object.keys(model.hourlyPatterns).length,
      daysLearned: Object.keys(model.dailyPatterns).length,
      falsePositiveRate: model.falsePositives / (model.truePositives + model.falsePositives + 1),
      adaptiveThresholds: model.adaptiveThresholds,
    };
  }

  /**
   * Save model to disk
   */
  async saveModel(patientId, model) {
    try {
      fs.mkdirSync(this.modelPath, { recursive: true });

      const modelFile = path.join(this.modelPath, `${patientId}-model.json`);
      fs.writeFileSync(modelFile, JSON.stringify(model, null, 2));

      console.log(`[AdvancedAlertML] ✅ Model saved for ${patientId}`);
    } catch (error) {
      console.error('[saveModel] Error:', error);
    }
  }

  /**
   * Load model from disk
   */
  async loadModel(patientId) {
    try {
      const modelFile = path.join(this.modelPath, `${patientId}-model.json`);

      if (fs.existsSync(modelFile)) {
        const model = JSON.parse(fs.readFileSync(modelFile, 'utf8'));
        this.behavioralPatterns[patientId] = model;
        console.log(`[AdvancedAlertML] ✅ Model loaded for ${patientId}`);
        return model;
      }
    } catch (error) {
      console.error('[loadModel] Error:', error);
    }

    return this.initializePatientModel(patientId);
  }
}

module.exports = AdvancedAlertML;
