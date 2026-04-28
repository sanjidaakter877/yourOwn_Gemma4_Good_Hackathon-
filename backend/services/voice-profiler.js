const fs = require("fs");
const path = require("path");

// Voice recognition service
// Uses audio fingerprinting to identify speakers

class VoiceProfiler {
  constructor() {
    this.voiceProfilesDir = path.join(__dirname, "../data/voice-profiles");
    this.initializeStorage();
  }

  initializeStorage() {
    if (!fs.existsSync(this.voiceProfilesDir)) {
      fs.mkdirSync(this.voiceProfilesDir, { recursive: true });
    }
  }

  /**
   * Create voice fingerprint from audio buffer
   * In production: Use advanced audio features (MFCC, spectrograms)
   * For MVP: Use basic audio characteristics
   */
  generateVoiceFingerprint(audioBuffer) {
    try {
      // Extract audio features (simplified for MVP)
      const features = {
        length: audioBuffer.length,
        rms: this.calculateRMS(audioBuffer),
        spectralCentroid: this.calculateSpectralCentroid(audioBuffer),
        zerosCrossingRate: this.calculateZeroCrossingRate(audioBuffer),
        timestamp: Date.now()
      };

      return Buffer.from(JSON.stringify(features)).toString("base64");
    } catch (error) {
      console.error("❌ Voice fingerprinting failed:", error.message);
      return null;
    }
  }

  /**
   * Calculate RMS (Root Mean Square) energy
   */
  calculateRMS(audioBuffer) {
    let sum = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      sum += audioBuffer[i] * audioBuffer[i];
    }
    return Math.sqrt(sum / audioBuffer.length);
  }

  /**
   * Calculate Zero Crossing Rate
   */
  calculateZeroCrossingRate(audioBuffer) {
    let zeroCount = 0;
    for (let i = 1; i < audioBuffer.length; i++) {
      if ((audioBuffer[i] >= 0) !== (audioBuffer[i - 1] >= 0)) {
        zeroCount++;
      }
    }
    return zeroCount / audioBuffer.length;
  }

  /**
   * Simplified Spectral Centroid
   */
  calculateSpectralCentroid(audioBuffer) {
    const fft = this.simpleFFT(audioBuffer.slice(0, 512));
    let weightedSum = 0;
    let sum = 0;

    for (let i = 0; i < fft.length; i++) {
      weightedSum += i * fft[i];
      sum += fft[i];
    }

    return sum > 0 ? weightedSum / sum : 0;
  }

  /**
   * Simplified FFT (real implementation would use FFTJS or similar)
   */
  simpleFFT(signal) {
    // Placeholder: return dummy frequency magnitudes
    return new Array(256).fill(0).map((_, i) => Math.sin(i / 50) * 0.5 + 0.5);
  }

  /**
   * Compare two voice fingerprints
   * Returns similarity score 0-1
   */
  compareFingerprints(fingerprint1, fingerprint2) {
    try {
      const features1 = JSON.parse(Buffer.from(fingerprint1, "base64").toString());
      const features2 = JSON.parse(Buffer.from(fingerprint2, "base64").toString());

      // Calculate Euclidean distance
      const rmsDistance = Math.abs(features1.rms - features2.rms) / Math.max(features1.rms, features2.rms, 0.001);
      const spectralDistance = Math.abs(features1.spectralCentroid - features2.spectralCentroid) / 256;
      const zcrDistance = Math.abs(features1.zerosCrossingRate - features2.zerosCrossingRate);

      // Weighted similarity (0 = different, 1 = identical)
      const similarity = 1 - (0.4 * rmsDistance + 0.3 * spectralDistance + 0.3 * zcrDistance);
      return Math.max(0, Math.min(1, similarity)); // Clamp to 0-1
    } catch (error) {
      console.error("❌ Fingerprint comparison failed:", error.message);
      return 0;
    }
  }

  /**
   * Store voice profile for a person
   */
  storeVoiceProfile(patientId, personName, personRelationship, audioBuffer) {
    try {
      const fingerprint = this.generateVoiceFingerprint(audioBuffer);
      if (!fingerprint) {
        return null;
      }

      const profileId = `voice_${Date.now()}`;
      const profile = {
        id: profileId,
        name: personName,
        relationship: personRelationship,
        voiceFingerprint: fingerprint,
        sampleCount: 1,
        reliability: 0.5,
        lastUpdated: new Date().toISOString(),
        customResponses: {
          greeting: `Hi ${personName}!`,
          emotion: "neutral"
        }
      };

      const patientVoiceDir = path.join(this.voiceProfilesDir, patientId);
      if (!fs.existsSync(patientVoiceDir)) {
        fs.mkdirSync(patientVoiceDir, { recursive: true });
      }

      const filePath = path.join(patientVoiceDir, `${profileId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));

      console.log(`✅ Voice profile stored: ${personName}`);
      return profile;
    } catch (error) {
      console.error("❌ Failed to store voice profile:", error.message);
      return null;
    }
  }

  /**
   * Identify speaker from audio
   */
  identifySpeaker(patientId, audioBuffer) {
    try {
      const incomingFingerprint = this.generateVoiceFingerprint(audioBuffer);
      if (!incomingFingerprint) {
        return null;
      }

      const patientVoiceDir = path.join(this.voiceProfilesDir, patientId);
      if (!fs.existsSync(patientVoiceDir)) {
        return null;
      }

      const profiles = fs.readdirSync(patientVoiceDir)
        .filter(f => f.endsWith(".json"))
        .map(f => JSON.parse(fs.readFileSync(path.join(patientVoiceDir, f))));

      let bestMatch = null;
      let bestSimilarity = 0;

      for (const profile of profiles) {
        const similarity = this.compareFingerprints(incomingFingerprint, profile.voiceFingerprint);

        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = profile;
        }
      }

      // Only return match if confidence is above threshold
      if (bestSimilarity > 0.7) {
        return {
          ...bestMatch,
          similarity: bestSimilarity,
          recognized: true
        };
      }

      return {
        recognized: false,
        similarity: bestSimilarity,
        message: "Voice not recognized. Who is speaking?"
      };
    } catch (error) {
      console.error("❌ Speaker identification failed:", error.message);
      return null;
    }
  }

  /**
   * Update voice profile with new samples
   */
  updateVoiceProfile(patientId, profileId, newAudioBuffer) {
    try {
      const profilePath = path.join(this.voiceProfilesDir, patientId, `${profileId}.json`);
      if (!fs.existsSync(profilePath)) {
        return null;
      }

      const profile = JSON.parse(fs.readFileSync(profilePath));
      const newFingerprint = this.generateVoiceFingerprint(newAudioBuffer);

      // Average the fingerprints (simple approach)
      const oldFeatures = JSON.parse(Buffer.from(profile.voiceFingerprint, "base64").toString());
      const newFeatures = JSON.parse(Buffer.from(newFingerprint, "base64").toString());

      const averagedFeatures = {
        rms: (oldFeatures.rms * profile.sampleCount + newFeatures.rms) / (profile.sampleCount + 1),
        spectralCentroid: (oldFeatures.spectralCentroid * profile.sampleCount + newFeatures.spectralCentroid) / (profile.sampleCount + 1),
        zerosCrossingRate: (oldFeatures.zerosCrossingRate * profile.sampleCount + newFeatures.zerosCrossingRate) / (profile.sampleCount + 1)
      };

      profile.voiceFingerprint = Buffer.from(JSON.stringify(averagedFeatures)).toString("base64");
      profile.sampleCount += 1;
      profile.reliability = Math.min(1, 0.5 + profile.sampleCount * 0.05); // Increases with samples
      profile.lastUpdated = new Date().toISOString();

      fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
      console.log(`✅ Voice profile updated: ${profile.name} (samples: ${profile.sampleCount})`);
      return profile;
    } catch (error) {
      console.error("❌ Failed to update voice profile:", error.message);
      return null;
    }
  }

  /**
   * Get all voice profiles for a patient
   */
  getPatientVoiceProfiles(patientId) {
    try {
      const patientVoiceDir = path.join(this.voiceProfilesDir, patientId);
      if (!fs.existsSync(patientVoiceDir)) {
        return [];
      }

      return fs.readdirSync(patientVoiceDir)
        .filter(f => f.endsWith(".json"))
        .map(f => JSON.parse(fs.readFileSync(path.join(patientVoiceDir, f))));
    } catch (error) {
      console.error("❌ Failed to get voice profiles:", error.message);
      return [];
    }
  }
}

module.exports = new VoiceProfiler();
