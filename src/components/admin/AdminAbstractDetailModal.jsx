// ====================================================================
// FILE 1: src/components/admin/AdminAbstractDetailModal.jsx
// ====================================================================
// ENHANCED VERSION with Edit button and better functionality

'use client';

import React from 'react';
import { X, FileText, User, Calendar, Building, Award, Download, CheckCircle, XCircle, Clock, Edit } from 'lucide-react';

export default function AdminAbstractDetailModal({ abstract, isOpen, onClose, onEdit }) {
  if (!isOpen || !abstract) return null;

  // Utilities
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // ✅ FIXED: Correct field mapping priorities (API-first approach)
  const presenterName = abstract.presenter_name || abstract.author || 'N/A';
  const institution = abstract.institution_name || abstract.affiliation || abstract.institution || 'N/A';
  const presentationType = abstract.presentation_type || abstract.category || 'Article';
  
  // ✅ FIXED: PEDICRITICON participant categories (not medical specialties)
  const participantCategory = abstract.category || 'Fellow'; // Default to Fellow for PEDICRITICON
  
  const coAuthors = abstract.co_authors || abstract.coAuthors || '';
  const submissionDate = abstract.submission_date || abstract.submissionDate || '';
  const files = abstract.files || abstract.fileList || []; // Support both field names
  const lastUpdated = abstract.updated_at || abstract.submissionDate || abstract.submission_date || '';
  const abstractContent = abstract.abstract_content || abstract.abstract || 'No content available';
  const reviewerComments = abstract.reviewer_comments || abstract.reviewerComments;
  const status = abstract.status || 'pending';
  const email = abstract.email || 'N/A';
  const mobile = abstract.mobile || abstract.phone || 'N/A';

  // ✅ NEW: Handle Edit button click
  const handleEdit = () => {
    if (onEdit) {
      onEdit(abstract);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Abstract Details - PEDICRITICON 2025</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            <span className="ml-2">{status.toUpperCase()}</span>
          </div>

          {/* Abstract Title */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{abstract.title}</h2>
            <div className="text-sm text-gray-500">
              Abstract ID: {abstract.id} • Abstract Number: {abstract.abstract_number || `ABST-${abstract.id}`} • Submitted: {submissionDate ? new Date(submissionDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          {/* Abstract Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Presenter Name</label>
                  <p className="mt-1 text-sm text-gray-900">{presenterName}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Institution</label>
                  <p className="mt-1 text-sm text-gray-900">{institution}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <p className="mt-1 text-sm text-gray-900">{mobile}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Presentation Type</label>
                  <p className="mt-1 text-sm text-gray-900">{presentationType}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Participant Category</label>
                  <p className="mt-1 text-sm text-gray-900">{participantCategory}</p>
                </div>
              </div>
              
              {!!coAuthors && (
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Co-authors</label>
                    <p className="mt-1 text-sm text-gray-900">{coAuthors}</p>
                  </div>
                </div>
              )}

              {abstract.registration_id && (
                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration ID</label>
                    <p className="mt-1 text-sm text-gray-900">{abstract.registration_id}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              {/* File Attachments */}
              {Array.isArray(files) && files.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Submitted Files ({files.length})
                  </label>
                  {files.map((file, index) => {
                    // ✅ FIXED: Support multiple file path formats
                    const key = file.key || (file.file_path && file.file_path.split('.com/')[1]);
                    const fileName = file.file_name || `File_${index + 1}`;
                    const fileSize = file.file_size || 0;
                    
                    if (!key && !file.file_path) return null;
                    
                    return (
                      <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <a
                            href={key ? `/api/files/sign?key=${encodeURIComponent(key)}` : file.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            {fileName}
                          </a>
                          <p className="text-xs text-gray-500 mt-1">
                            Size: {fileSize ? Math.round(fileSize / 1024) : '—'} KB
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legacy single file support */}
              {(!files || files.length === 0) && (abstract.file_name || abstract.file_path) && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Submitted File
                  </label>
                  <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <a
                        href={`/api/abstracts/download/${abstract.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {abstract.file_name || 'Abstract File'}
                      </a>
                      {abstract.file_size && (
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {Math.round(abstract.file_size / 1024)} KB
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* No files message */}
              {(!files || files.length === 0) && !abstract.file_name && !abstract.file_path && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Submitted Files
                  </label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-center">
                    <p className="text-sm text-red-600">❌ No files uploaded</p>
                  </div>
                </div>
              )}
              
              {/* Final File (if approved) */}
              {abstract.final_file_url && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Final Presentation</label>
                  <div className="flex items-start space-x-3 p-2 bg-green-50 rounded">
                    <FileText className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <a
                        href={abstract.final_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-green-600 hover:text-green-800"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download Final Presentation
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Last Updated */}
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Abstract Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Abstract Content</label>
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-900 max-h-60 overflow-y-auto border">
              {abstractContent}
            </div>
          </div>
          
          {/* Review Comments (if rejected) */}
          {status === 'rejected' && reviewerComments && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">❌ Reviewer Comments</h4>
              <p className="text-sm text-red-700">{reviewerComments}</p>
            </div>
          )}
          
          {/* ✅ FIXED: PEDICRITICON Approval Message */}
          {status === 'approved' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">🎉 Congratulations!</h4>
              <p className="text-sm text-green-700">
                Your abstract has been approved for presentation at PEDICRITICON 2025.
                {!abstract.final_file_url && ' Please upload your final presentation when ready.'}
              </p>
            </div>
          )}

          {/* ✅ NEW: Pending Status Message */}
          {status === 'pending' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">📋 Under Review</h4>
              <p className="text-sm text-yellow-700">
                Your abstract is currently under review by the PEDICRITICON 2025 scientific committee. 
                You will be notified once the review is complete.
              </p>
            </div>
          )}
          
          {/* ✅ NEW: PEDICRITICON Conference Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📅 Conference Information</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Conference:</strong> PEDICRITICON 2025</p>
              <p><strong>Theme:</strong> Pediatric Critical Care Excellence</p>
              <p><strong>Organizer:</strong> PICU Society</p>
              <p><strong>Status:</strong> Registration Open</p>
            </div>
          </div>

          {/* ✅ NEW: Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit/Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
