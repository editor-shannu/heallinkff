import { useState, useCallback } from 'react';
import { faceVerificationService, FaceVerificationResult } from '../services/faceVerification';

export const useFaceVerification = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FaceVerificationResult | null>(null);

  const registerFace = useCallback(async (userId: string, videoElement: HTMLVideoElement): Promise<FaceVerificationResult> => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      const verificationResult = await faceVerificationService.registerFace(userId, videoElement);
      setResult(verificationResult);
      return verificationResult;
    } catch (error) {
      const errorResult: FaceVerificationResult = {
        success: false,
        status: 'failure',
        message: 'Face registration failed. Please try again.'
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const verifyFace = useCallback(async (userId: string, videoElement: HTMLVideoElement): Promise<FaceVerificationResult> => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      const verificationResult = await faceVerificationService.verifyFace(userId, videoElement);
      setResult(verificationResult);
      return verificationResult;
    } catch (error) {
      const errorResult: FaceVerificationResult = {
        success: false,
        status: 'failure',
        message: 'Face verification failed. Please try again.'
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const checkAccountStatus = useCallback((userId: string) => {
    return {
      isTerminated: faceVerificationService.isAccountTerminated(userId),
      hasFaceRegistered: faceVerificationService.hasFaceRegistered(userId)
    };
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    isProcessing,
    result,
    registerFace,
    verifyFace,
    checkAccountStatus,
    clearResult
  };
};