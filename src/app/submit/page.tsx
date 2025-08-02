'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth-utils';
import ValidatedTextArea from '@/components/ValidatedTextArea';
import FileUpload from '@/components/FileUpload';
import { generateSubmissionId } from '@/lib/file-utils';
import { AlertCircle, Clock, CheckCircle, FileText, User } from 'lucide-react';

interface UploadedFile {
  originalName: string;
  fileName: string;
  size: number;
  type: string;
  path: string;
  uploadedAt: string;
}

export default function SubmitAbstract() {
  const router = useRouter();
  const [submissionId, setSubmissionId] = useState('sub_loading');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [user, setUser] = useState(null);
  const [wordCountValid, setWordCountValid] = useState(false);
  
  // Generate submission ID on client side to avoid hydration issues
  useEffect(() => {
    setSubmissionId(generateSubmissionId());
  }, []);
  
  // 🚀 UPDATED: Form data with category field
  const [formData, setFormData] = useState({
    title: '',
    presenter_name: '',
    institution_name: '',
    presentation_type: 'Poster', // Default to Poster
    category: 'Hematology', // 🚀 NEW: Separate category field
    abstract_content: '',
    co_authors: '',
    registration_payment_id: '',
    registration_number: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Authentication check and auto-fill user data
  useEffect(() => {
    console.log('🔍 Checking authentication...');
    if (!isAuthenticated()) {
      console.log('❌ Not authenticated, redirecting to login');
      router.push('/delegate-login');
      return;
    }
    
    const currentUser = getCurrentUser();
    console.log('👤 Current user:', currentUser);
    if (currentUser) {
      setUser(currentUser);
      // Auto-fill user data
      setFormData(prev => ({
        ...prev,
        presenter_name: currentUser.name || '',
        institution_name: currentUser.institution || '',
        registration_number: currentUser.registration_id || ''
      }));
    }
  }, [router]);

  const handleWordCountValidation = (validation) => {
    setWordCountValid(validation.isValid);
    console.log('📝 Word count validation:', validation);
  };

   const handleFileUploadComplete = (files: UploadedFile[]) => {
   setUploadedFiles(files);           // ← always the latest list
   console.log('Files uploaded successfully:', files);
 };

  const handleFileUploadError = (error: string) => {
    setMessage(`❌ File upload error: ${error}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Word count validation check
    if (!wordCountValid) {
      setMessage('❌ Please ensure your abstract meets the word limit requirements before submitting.');
      setLoading(false);
      return;
    }

    try {
      // Check if user is logged in
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage('❌ Please login first to submit abstract');
        setTimeout(() => router.push('/delegate-login'), 2000);
        setLoading(false);
        return;
      }

      // 🚀 UPDATED: Prepare submission data with category

      const submissionData = {
        title: formData.title,
        presenter_name: formData.presenter_name,
        institution_name: formData.institution_name,
        presentation_type: formData.presentation_type,
        category: formData.category,
        abstract_content: formData.abstract_content,
        co_authors: formData.co_authors,
        registration_payment_id: formData.registration_payment_id,
        registration_number: formData.registration_number,
	uploadedFiles,
        submissionId,
        submissionDate: new Date().toISOString(),
        status: 'pending',
        userId: user?.id,
        userEmail: user?.email
      };	

      console.log('🚀 Submitting to API with category:', submissionData.category);

      // Call real API
      const response = await fetch('/api/abstracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();
      console.log('📄 API Response:', result);

      if (response.ok && result.success) {
        setMessage(`✅ Abstract submitted successfully! 
        📝 Abstract ID: ${result.abstractId}
        🏷️ Category: ${formData.category}
        📂 Files: ${uploadedFiles.length} attached
        🎯 Status: Pending Review
        📧 Confirmation email sent to ${user?.email}`);
        
        // Reset form after successful submission
        setFormData({
          title: '',
          presenter_name: user?.name || '',
          institution_name: user?.institution || '',
          presentation_type: 'Poster', // Default to Poster
          category: 'Hematology', // 🚀 NEW: Reset to default category
          abstract_content: '',
          co_authors: '',
          registration_payment_id: '',
          registration_number: user?.registration_id || '',
        });
        setUploadedFiles([]);
        
        // Redirect to delegate dashboard after 5 seconds
        setTimeout(() => {
          router.push('/delegate-dashboard');
        }, 5000);
      } else {
        throw new Error(result.error || 'Submission failed');
      }

    } catch (error) {
      console.error('❌ Submission error:', error);
      setMessage(`❌ Submission failed: ${error.message || 'Network error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📝 Submit Research Abstract
          </h1>
          <p className="text-xl text-gray-600">
            PEDICRITICON 2025, 27th National Conference of the IAP Intensive Care Chapter
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="text-sm text-blue-600 bg-blue-50 inline-block px-4 py-2 rounded-lg">
              📝 Submission ID: {submissionId}
            </div>
            <div className="text-sm text-green-600 bg-green-50 inline-block px-4 py-2 rounded-lg flex items-center">
              <User className="h-4 w-4 mr-1" />
              Welcome, {user.name}
            </div>
          </div>
          <button
            onClick={() => router.push('/delegate-dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-800 underline font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Guidelines Panel - UPDATED with 300 word limit */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Submission Guidelines</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className='text-green-600'>Prior registration required for presentation</span>
              </div>
              
              <div className="flex items-start text-red-600">
                <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Deadline:</strong> 31st August 2025 (extended)</span>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-3">
                <p className="font-medium text-red-800">Online submission only</p>
                <p className="text-red-700 text-xs">Previously published abstracts not permitted</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <FileText className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  {/* 🚀 UPDATED: Changed from 250 to 300 words */}
                  <p><strong className="text-black bg-white">Word Limit: All Categories</strong></p>
                  <ul className="ml-4 mt-1 space-y-1 text-xs text-red-600 bg-white">
                    <li>• Award Paper: 300 words</li>
                    <li>• Articles : 300 words</li>
                    <li>• Case Report: 300 words</li>
                    <li>• Poster: 300 words</li>
                    {/* <li>• Oral Paper: 300 words</li> */}
                    {/* <li>• Oral Presentation: 300 words</li> */}
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium text-blue-800">Time Allocation:</p>
                <p className="text-blue-700 text-xs">
                  Award Paper: 6+2 min | Articles: 5+2 min | Case Report: 5+2 min | Poster: 5+2 min
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            <p className="text-blue-800 text-sm">
              <strong>Required Structure:</strong> Objectives, Methods (include statistical methods where relevant), Results, Conclusion
            </p>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 whitespace-pre-line ${
            message.includes('✅') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
            {message.includes('✅') && (
              <div className="mt-3 text-sm text-green-600">
                🏠 Redirecting to dashboard in 5 seconds...
              </div>
            )}
          </div>
        )}

        {/* Abstract Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Abstract Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abstract Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  placeholder="Enter your research title"
                  disabled={loading}
                />
              </div>

              {/* Presenter Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presenter Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.presenter_name}
                  onChange={(e) => setFormData({...formData, presenter_name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  placeholder="Primary presenter name"
                  disabled={loading}
                />
              </div>

              {/* Registration Payment ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Payment ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.registration_payment_id}
                  onChange={(e) => setFormData({...formData, registration_payment_id: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white "
                  placeholder="Enter payment reference ID"
                  disabled={loading}
                />
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white"
                  placeholder="Auto-filled from profile"
                  readOnly
                />
              </div>

              {/* Institution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution/Hospital *
                </label>
                <input
                  type="text"
                  required
                  value={formData.institution_name}
                  onChange={(e) => setFormData({...formData, institution_name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  placeholder="Your institution name"
                  disabled={loading}
                />
              </div>

              {/* Presentation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presentation Type *
                </label>
                <select
                  required
                  value={formData.presentation_type}
                  onChange={(e) => setFormData({...formData, presentation_type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  disabled={loading}
                >
                  {/* <option value="Free Paper">Free Paper</option> */}
                  <option value="Poster"></option>
                  { <><option value="E-Poster">Article</option><option value="Award Paper">Award Paper</option></> }
                  <option value="Oral">Case Report </option>
                  <option value="Oral">Poster</option>
                </select>
              </div>

              {/* 🚀 NEW: Category Field (as requested in DOCX) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  disabled={loading}
                >
                  <option value="Hematology">Fellow</option>
                  <option value="Oncology">Postgraduate</option>
                  <option value="InPHOG">Nurses</option>
                  <option value="Nursing">Open category</option>
                  {/* <option value="HSCT">HSCT</option> */}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select the primary medical category for your research
                </p>
              </div>

              {/* Co-Authors */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Co-Authors (Optional)
                </label>
                <input
                  type="text"
                  value={formData.co_authors}
                  onChange={(e) => setFormData({...formData, co_authors: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  placeholder="Comma-separated co-author names"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Abstract Content with 300 Word Validation */}
            <div className="space-y-4 text-black bg-white">
              <ValidatedTextArea
                value={formData.abstract_content}
                onChange={(content) => setFormData({...formData, abstract_content: content})}
                presentationType={formData.presentation_type}
                onValidationChange={handleWordCountValidation}
                disabled={loading}
                required={true}
                placeholder="Enter your complete abstract here....."
              />
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                📎 Supporting Documents
              </label>
              <FileUpload
                submissionId={submissionId}
                onUploadComplete={handleFileUploadComplete}
                onUploadError={handleFileUploadError}
                maxFiles={3}
                disabled={loading}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-3 text-sm text-green-600">
                  ✅ {uploadedFiles.length} file(s) attached to this submission
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || !wordCountValid}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ⏳ Submitting Abstract...
                  </div>
                ) : !wordCountValid ? (
                  '❌ Fix Word Count to Submit'
                ) : (
                  '🚀 Submit Abstract'
                )}
              </button>
              
              {!wordCountValid && (
                <p className="text-sm text-red-600 text-center mt-2">
                  Please ensure your abstract meets word limit requirements.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* System Info */}
        <div className="mt-6 text-center text-gray-500">
          <p>🚀 PEDICRITICON 2025, 27th National Conference of the IAP Intensive Care Chapter</p>
          {/* <p>⚡ Built with Next.js 15 + PRD Compliant Implementation</p> */}
          {/* <p className="text-xs mt-1">🔄 Word Limit: 300 words • Category Support: Enabled</p> */}
        </div>
      </div>
    </div>
  );
}