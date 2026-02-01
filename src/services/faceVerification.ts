import * as faceapi from 'face-api.js';
import CryptoJS from 'crypto-js';

// Encryption key - in production, this should be from environment variables
const ENCRYPTION_KEY = 'heal-link-face-encryption-key-2024';

export interface FaceVerificationResult {
  success: boolean;
  status: 'success' | 'failure' | 'duplicate-face-detected' | 'no-face-detected' | 'multiple-faces-detected';
  confidence?: number;
  message: string;
}

export interface StoredFaceData {
  userId: string;
  encryptedEmbedding: string;
  createdAt: string;
  lastVerified?: string;
}

class FaceVerificationService {
  private isInitialized = false;
  private readonly SIMILARITY_THRESHOLD = 0.95;
  private readonly ENCRYPTION_KEY = ENCRYPTION_KEY;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load face-api.js models
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      
      this.isInitialized = true;
      console.log('Face verification service initialized');
    } catch (error) {
      console.error('Failed to initialize face verification:', error);
      throw new Error('Face verification service initialization failed');
    }
  }

  async captureAndProcessFace(videoElement: HTMLVideoElement): Promise<Float32Array | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Detect face with landmarks and descriptor
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        return null;
      }

      return detection.descriptor;
    } catch (error) {
      console.error('Face processing error:', error);
      return null;
    }
  }

  private encryptEmbedding(embedding: Float32Array): string {
    const embeddingString = Array.from(embedding).join(',');
    return CryptoJS.AES.encrypt(embeddingString, this.ENCRYPTION_KEY).toString();
  }

  private decryptEmbedding(encryptedEmbedding: string): Float32Array {
    const decrypted = CryptoJS.AES.decrypt(encryptedEmbedding, this.ENCRYPTION_KEY);
    const embeddingString = decrypted.toString(CryptoJS.enc.Utf8);
    const embeddingArray = embeddingString.split(',').map(Number);
    return new Float32Array(embeddingArray);
  }

  private calculateSimilarity(embedding1: Float32Array, embedding2: Float32Array): number {
    // Calculate Euclidean distance
    let sum = 0;
    for (let i = 0; i < embedding1.length; i++) {
      sum += Math.pow(embedding1[i] - embedding2[i], 2);
    }
    const distance = Math.sqrt(sum);
    
    // Convert distance to similarity score (0-1, where 1 is identical)
    return Math.max(0, 1 - distance);
  }

  async registerFace(userId: string, videoElement: HTMLVideoElement): Promise<FaceVerificationResult> {
    try {
      const embedding = await this.captureAndProcessFace(videoElement);
      
      if (!embedding) {
        return {
          success: false,
          status: 'no-face-detected',
          message: 'No face detected. Please ensure your face is clearly visible.'
        };
      }

      // Check for duplicate faces across all accounts
      const duplicateCheck = await this.checkForDuplicateFace(embedding, userId);
      if (!duplicateCheck.success) {
        return duplicateCheck;
      }

      // Encrypt and store the embedding
      const encryptedEmbedding = this.encryptEmbedding(embedding);
      const faceData: StoredFaceData = {
        userId,
        encryptedEmbedding,
        createdAt: new Date().toISOString()
      };

      // Store in localStorage (in production, use secure database)
      const existingData = this.getAllStoredFaces();
      existingData[userId] = faceData;
      localStorage.setItem('heal_link_face_data', JSON.stringify(existingData));

      return {
        success: true,
        status: 'success',
        message: 'Face registered successfully'
      };
    } catch (error) {
      console.error('Face registration error:', error);
      return {
        success: false,
        status: 'failure',
        message: 'Face registration failed. Please try again.'
      };
    }
  }

  async verifyFace(userId: string, videoElement: HTMLVideoElement): Promise<FaceVerificationResult> {
    try {
      const currentEmbedding = await this.captureAndProcessFace(videoElement);
      
      if (!currentEmbedding) {
        return {
          success: false,
          status: 'no-face-detected',
          message: 'No face detected. Please ensure your face is clearly visible.'
        };
      }

      // Get stored face data for user
      const storedFaceData = this.getStoredFaceData(userId);
      if (!storedFaceData) {
        return {
          success: false,
          status: 'failure',
          message: 'No registered face found. Please register your face first.'
        };
      }

      // Decrypt stored embedding
      const storedEmbedding = this.decryptEmbedding(storedFaceData.encryptedEmbedding);
      
      // Calculate similarity
      const similarity = this.calculateSimilarity(currentEmbedding, storedEmbedding);
      const confidence = Math.round(similarity * 100);

      if (similarity >= this.SIMILARITY_THRESHOLD) {
        // Update last verified timestamp
        storedFaceData.lastVerified = new Date().toISOString();
        const allData = this.getAllStoredFaces();
        allData[userId] = storedFaceData;
        localStorage.setItem('heal_link_face_data', JSON.stringify(allData));

        return {
          success: true,
          status: 'success',
          confidence,
          message: `Face verified successfully (${confidence}% match)`
        };
      } else {
        return {
          success: false,
          status: 'failure',
          confidence,
          message: `Face verification failed (${confidence}% match). Please try again or use alternate authentication.`
        };
      }
    } catch (error) {
      console.error('Face verification error:', error);
      return {
        success: false,
        status: 'failure',
        message: 'Face verification failed. Please try again.'
      };
    }
  }

  private async checkForDuplicateFace(newEmbedding: Float32Array, currentUserId: string): Promise<FaceVerificationResult> {
    const allFaceData = this.getAllStoredFaces();
    
    for (const [userId, faceData] of Object.entries(allFaceData)) {
      if (userId === currentUserId) continue;
      
      const storedEmbedding = this.decryptEmbedding(faceData.encryptedEmbedding);
      const similarity = this.calculateSimilarity(newEmbedding, storedEmbedding);
      
      if (similarity >= this.SIMILARITY_THRESHOLD) {
        // Duplicate face detected - terminate the duplicate account
        await this.terminateDuplicateAccount(userId);
        
        return {
          success: false,
          status: 'duplicate-face-detected',
          confidence: Math.round(similarity * 100),
          message: `Duplicate face detected. Account ${userId} has been terminated. Only the first registered account is allowed.`
        };
      }
    }
    
    return {
      success: true,
      status: 'success',
      message: 'No duplicate face found'
    };
  }

  private async terminateDuplicateAccount(userId: string): Promise<void> {
    // Remove face data
    const allData = this.getAllStoredFaces();
    delete allData[userId];
    localStorage.setItem('heal_link_face_data', JSON.stringify(allData));
    
    // Add to terminated accounts list
    const terminatedAccounts = JSON.parse(localStorage.getItem('heal_link_terminated_accounts') || '[]');
    terminatedAccounts.push({
      userId,
      terminatedAt: new Date().toISOString(),
      reason: 'duplicate-face-detected'
    });
    localStorage.setItem('heal_link_terminated_accounts', JSON.stringify(terminatedAccounts));
    
    console.log(`Account ${userId} terminated due to duplicate face detection`);
  }

  private getAllStoredFaces(): Record<string, StoredFaceData> {
    const data = localStorage.getItem('heal_link_face_data');
    return data ? JSON.parse(data) : {};
  }

  private getStoredFaceData(userId: string): StoredFaceData | null {
    const allData = this.getAllStoredFaces();
    return allData[userId] || null;
  }

  isAccountTerminated(userId: string): boolean {
    const terminatedAccounts = JSON.parse(localStorage.getItem('heal_link_terminated_accounts') || '[]');
    return terminatedAccounts.some((account: any) => account.userId === userId);
  }

  hasFaceRegistered(userId: string): boolean {
    return !!this.getStoredFaceData(userId);
  }
}

export const faceVerificationService = new FaceVerificationService();