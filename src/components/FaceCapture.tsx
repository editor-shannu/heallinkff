import React, { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Camera, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FaceCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (videoElement: HTMLVideoElement) => Promise<void>;
  title: string;
  subtitle: string;
  isProcessing: boolean;
}

export const FaceCapture: React.FC<FaceCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
  title,
  subtitle,
  isProcessing
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  const handleCapture = async () => {
    if (videoRef.current && cameraReady) {
      await onCapture(videoRef.current);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#1d2366]">{title}</h3>
              <p className="text-sm text-[#3bacd6]">{subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Camera View */}
          <div className="relative mb-6">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startCamera}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Face detection overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-[#3bacd6] rounded-full opacity-50"></div>
                  </div>
                  
                  {/* Camera status indicator */}
                  <div className="absolute top-2 right-2">
                    {cameraReady ? (
                      <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Loading</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Position your face within the circle and ensure good lighting
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>✓ Look directly at camera</span>
              <span>✓ Remove glasses if possible</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCapture}
              disabled={!cameraReady || isProcessing || !!error}
              className="flex-1 bg-[#3bacd6] hover:bg-[#3bacd6]/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};