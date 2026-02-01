import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { DocumentUpload } from '../components/DocumentUpload';
import { documentsAPI } from '../services/api';
import { supabase } from '../lib/supabase';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { ArrowLeft, Plus, ChevronDown, ChevronRight, FileText, Heart, Settings as Lungs, Brain, Bone, LucideKey as Kidney, Baby, Palette, Thermometer, AlertTriangle } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: string;
}

interface MedicalCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  subcategories?: string[];
  recordCount: number;
  isExpanded: boolean;
  documents: Document[];
}

interface MedicalRecordsScreenProps {
  onBack: () => void;
}

export const MedicalRecordsScreen: React.FC<MedicalRecordsScreenProps> = ({
  onBack
}) => {
  const { user } = useFirebaseAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [categories, setCategories] = useState<MedicalCategory[]>([
    {
      id: 'emr',
      name: 'Emergency Medical Record (EMR)',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
      recordCount: 0,
      isExpanded: true, // Always visible
      documents: []
    },
    {
      id: 'heart',
      name: 'Heart',
      icon: Heart,
      color: 'text-red-500 bg-red-50',
      recordCount: 0,
      isExpanded: false,
      documents: []
    },
    {
      id: 'lungs',
      name: 'Lungs',
      icon: Lungs,
      color: 'text-blue-500 bg-blue-50',
      recordCount: 0,
      isExpanded: false,
      documents: []
    },
    {
      id: 'stomach',
      name: 'Stomach & Intestines',
      icon: FileText,
      color: 'text-orange-500 bg-orange-50',
      recordCount: 0,
      isExpanded: false,
      documents: []
    },
    {
      id: 'brain',
      name: 'Brain & Nerves',
      icon: Brain,
      color: 'text-purple-500 bg-purple-50',
      recordCount: 0,
      isExpanded: false,
      documents: []
    },
    {
      id: 'bones',
      name: 'Bones & Joints',
      icon: Bone,
      color: 'text-gray-600 bg-gray-50',
      recordCount: 0,
      isExpanded: false,
      documents: []
    },
    {
      id: 'kidneys',
      name: 'Kidneys & Urinary',
      icon: Kidney,
      color: 'text-yellow-600 bg-yellow-50',
      recordCount: 0,
      isExpanded: false,
      documents: []
    },
    {
      id: 'reproductive',
      name: 'Reproductive Organs',
      icon: Baby,
      color: 'text-pink-500 bg-pink-50',
      recordCount: 0,
      isExpanded: false,
      documents: []
    },
    {
      id: 'skin',
      name: 'Skin',
      icon: Palette,
      color: 'text-green-500 bg-green-50',
      recordCount: 0,
      isExpanded: false,
      documents: []
    },
    {
      id: 'general',
      name: 'General & Fever',
      icon: Thermometer,
      color: 'text-indigo-500 bg-indigo-50',
      subcategories: ['ENT', 'Flu', 'Viral', 'Checkups'],
      recordCount: 0,
      isExpanded: false,
      documents: []
    }
  ]);

  // Load documents from database
  React.useEffect(() => {
    const loadDocuments = async () => {
      if (user?.uid) {
        try {
          // Load from Supabase database
          const { data, error } = await supabase
            .from('medical_documents')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });

          let userDocuments = [];
          if (error) {
            console.error('Database error:', error);
            // Fallback to localStorage
            const saved = localStorage.getItem('heal_link_medical_documents');
            const allDocuments = saved ? JSON.parse(saved) : [];
            userDocuments = allDocuments.filter((doc: any) => doc.user_id === user.uid);
          } else {
            userDocuments = data || [];
          }
          
          // Organize documents by category
          const updatedCategories = categories.map(category => {
            const categoryDocs = userDocuments.filter((doc: any) => doc.category === category.id);
            return {
              ...category,
              documents: categoryDocs,
              recordCount: categoryDocs.length
            };
          });
          setCategories(updatedCategories);
        } catch (error) {
          console.error('Error loading documents:', error);
        }
      }
      setLoading(false);
    };

    loadDocuments();
  }, [user]);
  const toggleCategory = (categoryId: string) => {
    // Don't allow collapsing EMR - it stays permanently visible
    if (categoryId === 'emr') return;
    
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, isExpanded: !category.isExpanded }
          : category
      )
    );
  };

  const handleDocumentUpload = (documents: Document[]) => {
    // Process each document with AI analysis
    documents.forEach(async (doc) => {
      try {
        if (!user?.uid) {
          console.error('User not authenticated');
          return;
        }

        let analysisResult = { category: doc.category, filePath: '' };
        
        if (doc.file) {
          try {
            const analysis = await documentsAPI.analyzeDocument(doc.file);
            analysisResult = analysis;
          } catch (error) {
            console.error('Document analysis failed:', error);
          }
          
          console.log('Uploading document to database:', {
            user_id: user.uid,
            name: doc.name,
            category: analysisResult.category || doc.category
          });

          const { data, error } = await supabase
            .from('medical_documents')
            .insert([{
              user_id: user.uid,
              name: doc.name,
              type: doc.type,
              size: doc.size,
              category: analysisResult.category || doc.category,
              file_path: analysisResult.filePath || URL.createObjectURL(doc.file)
            }])
            .select()
            .single();

          if (error) {
            console.error('Database error:', error);
            throw error;
          }

          console.log('Document uploaded successfully:', data);
          
          // Update categories with new document
          setCategories(prev => prev.map(cat => {
            if (cat.id === (analysisResult.category || doc.category)) {
              return {
                ...cat,
                documents: [...cat.documents, { 
                  ...doc, 
                  id: data.id,
                  category: analysisResult.category || doc.category,
                  filePath: analysisResult.filePath || URL.createObjectURL(doc.file)
                }],
                recordCount: cat.recordCount + 1
              };
            }
            return cat;
          }));
        }
      } catch (error) {
        console.error('Document upload failed:', error);
      }
    });
  };

  const handleDocumentClick = (document: Document) => {
    if (document.filePath) {
      // Open document in new tab
      window.open(document.filePath, '_blank');
    } else if (document.file) {
      // Create temporary URL for file viewing
      const url = URL.createObjectURL(document.file);
      window.open(url, '_blank');
      // Clean up URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      alert('Document not available for viewing');
    }
  };
  const renderDocumentPreviews = (category: MedicalCategory) => {
    if (category.documents.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No documents uploaded</p>
          <p className="text-gray-400 text-xs mt-1">Upload documents to see them here</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-3 mt-3">
        {category.documents.slice(0, 6).map((document, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => handleDocumentClick(document)}
            title={`Click to view ${document.name}`}
          >
            <FileText className="w-8 h-8 text-white" />
            <div className="absolute bottom-1 left-1 right-1 text-xs text-white truncate bg-black bg-opacity-50 px-1 rounded">
              {document.name}
            </div>
          </div>
        ))}
        {category.documents.length > 6 && (
          <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">+{category.documents.length - 6}</span>
          </div>
        )}
      </div>
    );
  };

  const handleAddRecord = () => {
    setShowUpload(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
          aria-label="Go back to previous screen"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        
        <h1 className="text-xl font-semibold text-gray-800 font-['Inter']">
          Medical Records
        </h1>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddRecord}
          className="p-2"
          aria-label="Add new medical record"
        >
          <Plus className="w-5 h-5 text-blue-600" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isEMR = category.id === 'emr';
            
            return (
              <Card 
                key={category.id}
                className={`border-0 shadow-sm rounded-2xl transition-all duration-200 ${
                  isEMR ? 'border-l-4 border-l-red-500 bg-red-50' : 'bg-white hover:shadow-md'
                }`}
              >
                <CardContent className="p-4">
                  {/* Category Header */}
                  <div
                    className={`flex items-center justify-between ${
                      !isEMR ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => toggleCategory(category.id)}
                    role={!isEMR ? "button" : undefined}
                    tabIndex={!isEMR ? 0 : undefined}
                    aria-expanded={category.isExpanded}
                    aria-label={`${category.isExpanded ? 'Collapse' : 'Expand'} ${category.name} section`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${category.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-gray-800 font-['Inter'] ${
                          isEMR ? 'text-red-800' : ''
                        }`}>
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.recordCount} record{category.recordCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    {!isEMR && (
                      <div className="flex items-center space-x-2">
                        {category.isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400 transition-transform duration-200" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Subcategories (for General & Fever) */}
                  {category.subcategories && category.isExpanded && (
                    <div className="mt-3 mb-3">
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((sub, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Previews */}
                  {(category.isExpanded || isEMR) && (
                    <div className="transition-all duration-300 ease-in-out">
                      {renderDocumentPreviews(category)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleDocumentUpload}
      />
    </>
  );
};