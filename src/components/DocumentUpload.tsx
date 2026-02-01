import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Upload, FileText, X, Eye, Download } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: string;
  file?: File;
  preview?: string;
}

interface DocumentUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (documents: Document[]) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categorizeDocument = (fileName: string): string => {
    const name = fileName.toLowerCase();
    
    if (name.includes('heart') || name.includes('cardiac') || name.includes('ecg') || name.includes('ekg')) {
      return 'heart';
    } else if (name.includes('lung') || name.includes('chest') || name.includes('respiratory')) {
      return 'lungs';
    } else if (name.includes('brain') || name.includes('neuro') || name.includes('mri') || name.includes('ct')) {
      return 'brain';
    } else if (name.includes('bone') || name.includes('joint') || name.includes('xray') || name.includes('x-ray')) {
      return 'bones';
    } else if (name.includes('blood') || name.includes('lab') || name.includes('test')) {
      return 'general';
    } else if (name.includes('emergency') || name.includes('emr')) {
      return 'emr';
    }
    
    return 'general';
  };

  const handleFiles = (files: FileList) => {
    const newDocuments: Document[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString(),
      category: categorizeDocument(file.name),
      file
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = () => {
    onUpload(documents);
    setDocuments([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Upload Medical Documents</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF, JPG, PNG files up to 10MB
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Document List */}
          {documents.length > 0 && (
            <div className="max-h-60 overflow-y-auto mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Selected Documents:</h4>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(doc.size)} • Will be filed under: {doc.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={documents.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Upload {documents.length} Document{documents.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};