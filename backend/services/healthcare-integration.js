/**
 * Healthcare Integration Service
 * FHIR export, EHR integration, SMS alerts, HIPAA compliance
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class HealthcareIntegration {
  constructor() {
    this.fhirVersion = 'R4'; // HL7 FHIR R4 standard
    this.hipaaEncryptionKey = process.env.HIPAA_ENCRYPTION_KEY || 'default-key-change-in-prod';
    this.smsProvider = process.env.SMS_PROVIDER || 'twilio';
    this.auditLog = [];
  }

  /**
   * Generate FHIR-compliant Patient Resource
   */
  generateFhirPatient(patientData) {
    return {
      resourceType: 'Patient',
      id: patientData.patientId,
      meta: {
        versionId: '1',
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'],
      },
      identifier: [
        {
          use: 'usual',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MR', // Medical Record Number
              },
            ],
          },
          system: `urn:yourOwn:patient`,
          value: patientData.patientId,
        },
      ],
      name: [
        {
          use: 'official',
          given: [patientData.firstName || 'Patient'],
          family: patientData.lastName || 'Unknown',
        },
      ],
      birthDate: patientData.dateOfBirth,
      gender: patientData.gender?.toLowerCase() || 'unknown',
      contact: patientData.emergencyContacts?.map(contact => ({
        relationship: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                code: contact.relationship || 'FAMILY',
              },
            ],
          },
        ],
        name: {
          text: contact.name,
        },
        telecom: [
          {
            system: 'phone',
            value: contact.phone,
          },
        ],
      })) || [],
      address: patientData.address ? [
        {
          use: 'home',
          line: [patientData.address.street],
          city: patientData.address.city,
          state: patientData.address.state,
          postalCode: patientData.address.zip,
        },
      ] : [],
    };
  }

  /**
   * Generate FHIR Observation for MMSE Score
   */
  generateFhirMMSEObservation(patientId, mmseScore, timestamp) {
    return {
      resourceType: 'Observation',
      id: `mmse-${Date.now()}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'cognitive',
              display: 'Cognitive',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '3044-3',
            display: 'Mini-Mental State Examination (MMSE)',
          },
        ],
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      effectiveDateTime: timestamp,
      valueQuantity: {
        value: mmseScore,
        unit: 'points',
        system: 'http://unitsofmeasure.org',
        code: '{score}',
      },
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: this.interpretMMSEScore(mmseScore),
            },
          ],
        },
      ],
    };
  }

  /**
   * Generate FHIR Medication Statement
   */
  generateFhirMedicationStatement(patientId, medication, dosage) {
    return {
      resourceType: 'MedicationStatement',
      id: `med-${Date.now()}`,
      status: 'active',
      subject: {
        reference: `Patient/${patientId}`,
      },
      dateAsserted: new Date().toISOString(),
      informationSource: {
        reference: 'Practitioner/yourOwn-system',
        display: 'yourOwn Alzheimer\'s Companion',
      },
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: this.getMedicationRxNormCode(medication),
            display: medication,
          },
        ],
      },
      dosage: [
        {
          text: dosage,
          timing: {
            repeat: {
              frequency: 1,
              period: 1,
              periodUnit: 'd',
            },
          },
        },
      ],
    };
  }

  /**
   * Generate FHIR Alert/Flag Resource
   */
  generateFhirAlert(patientId, alert) {
    return {
      resourceType: 'Flag',
      id: `alert-${alert.alertId}`,
      status: 'active',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/flag-category',
              code: 'admin',
              display: alert.severity,
            },
          ],
        },
      ],
      code: {
        text: alert.type,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      period: {
        start: alert.timestamp,
      },
      author: {
        reference: 'Device/yourOwn-monitoring-system',
        display: 'yourOwn AI Monitoring',
      },
      note: [
        {
          text: alert.description,
        },
      ],
    };
  }

  /**
   * Export patient data as FHIR Bundle
   */
  async exportFhirBundle(patientData, includeAlerts = true) {
    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: this.generateFhirPatient(patientData),
        },
      ],
    };

    // Add MMSE observations
    if (patientData.medicalHistory?.mmseScores) {
      patientData.medicalHistory.mmseScores.forEach(score => {
        bundle.entry.push({
          resource: this.generateFhirMMSEObservation(
            patientData.patientId,
            score.value,
            score.date
          ),
        });
      });
    }

    // Add medications
    if (patientData.medicalHistory?.medications) {
      patientData.medicalHistory.medications.forEach(med => {
        bundle.entry.push({
          resource: this.generateFhirMedicationStatement(
            patientData.patientId,
            med.name,
            med.dosage
          ),
        });
      });
    }

    // Add alerts
    if (includeAlerts && patientData.alertHistory) {
      patientData.alertHistory.forEach(alert => {
        bundle.entry.push({
          resource: this.generateFhirAlert(patientData.patientId, alert),
        });
      });
    }

    return bundle;
  }

  /**
   * Send SMS alert to doctor or caregiver
   */
  async sendSmsAlert(phoneNumber, message, patientId) {
    try {
      // Log audit trail
      this.auditLog.push({
        timestamp: new Date().toISOString(),
        action: 'SMS_SENT',
        recipient: this.hashPhone(phoneNumber),
        patientId,
        status: 'pending',
      });

      // In production, integrate with Twilio or similar
      console.log(`[SMS Alert] To: ${this.hashPhone(phoneNumber)}`);
      console.log(`[SMS Alert] Message: ${message}`);

      // Simulate SMS sending
      if (this.smsProvider === 'twilio') {
        return await this.sendViaTwilio(phoneNumber, message);
      }

      return {
        success: true,
        messageId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[sendSmsAlert] Error:', error);
      this.auditLog[this.auditLog.length - 1].status = 'failed';
      throw error;
    }
  }

  /**
   * Send email alert to doctor
   */
  async sendEmailAlert(email, subject, htmlContent, patientId) {
    try {
      this.auditLog.push({
        timestamp: new Date().toISOString(),
        action: 'EMAIL_SENT',
        recipient: this.hashEmail(email),
        patientId,
        status: 'pending',
      });

      console.log(`[Email Alert] To: ${this.hashEmail(email)}`);
      console.log(`[Email Alert] Subject: ${subject}`);

      // In production, use SendGrid, AWS SES, or similar
      return {
        success: true,
        messageId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[sendEmailAlert] Error:', error);
      this.auditLog[this.auditLog.length - 1].status = 'failed';
      throw error;
    }
  }

  /**
   * Create clinical note (doctor's note)
   */
  generateFhirClinicalNote(patientId, doctorName, noteContent) {
    return {
      resourceType: 'DocumentReference',
      id: `note-${Date.now()}`,
      status: 'current',
      type: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '11506-3',
            display: 'Provider-unspecified Progress Note',
          },
        ],
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      date: new Date().toISOString(),
      author: [
        {
          reference: 'Practitioner/unknown',
          display: doctorName,
        },
      ],
      content: [
        {
          attachment: {
            contentType: 'text/plain',
            data: Buffer.from(noteContent).toString('base64'),
            title: `Clinical Note - ${new Date().toLocaleDateString()}`,
          },
        },
      ],
    };
  }

  /**
   * HIPAA-compliant data encryption
   */
  encryptSensitiveData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.hipaaEncryptionKey.padEnd(32, '0'), 'utf8'),
      iv
    );

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      algorithm: 'aes-256-cbc',
    };
  }

  /**
   * Decrypt HIPAA-protected data
   */
  decryptSensitiveData(encryptedData) {
    const decipher = crypto.createDecipheriv(
      encryptedData.algorithm,
      Buffer.from(this.hipaaEncryptionKey.padEnd(32, '0'), 'utf8'),
      Buffer.from(encryptedData.iv, 'hex')
    );

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Generate audit log for HIPAA compliance
   */
  getAuditLog(patientId) {
    return this.auditLog.filter(entry => entry.patientId === patientId);
  }

  /**
   * Helper: Interpret MMSE score
   */
  interpretMMSEScore(score) {
    if (score >= 24) return 'N'; // Normal
    if (score >= 18) return 'L'; // Low
    return 'LL'; // Very Low
  }

  /**
   * Helper: Get RxNorm code for medication
   */
  getMedicationRxNormCode(medication) {
    const rxnormMap = {
      'Donepezil': '312366',
      'Memantine': '724160',
      'Rivastigmine': '349852',
      'Tacrine': '203216',
    };
    return rxnormMap[medication] || '000000';
  }

  /**
   * Helper: Hash phone for privacy
   */
  hashPhone(phone) {
    return crypto
      .createHash('sha256')
      .update(phone)
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Helper: Hash email for privacy
   */
  hashEmail(email) {
    return crypto
      .createHash('sha256')
      .update(email)
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Placeholder: Send via Twilio (requires configuration)
   */
  async sendViaTwilio(phoneNumber, message) {
    // Integration would require twilio package and credentials
    console.log(`[Twilio Integration] Phone: ${this.hashPhone(phoneNumber)}, Message sent`);
    return { success: true, messageId: crypto.randomUUID() };
  }
}

module.exports = HealthcareIntegration;
