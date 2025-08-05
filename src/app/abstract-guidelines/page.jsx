'use client';
import React, { useState } from 'react';
import { 
  AlertCircle, Clock, FileText, CheckCircle, ArrowRight, Users, 
  Calendar, Award, Download, ExternalLink, ArrowLeft, Shield,
  Eye, Upload, Palette, Image, Monitor, Type, Zap, Coffee,
  GraduationCap, BookOpen, Star, Trophy, Target, MapPin
} from 'lucide-react';

export default function AbstractGuidelines() {
  const [activeTab, setActiveTab] = useState('general');

  const handleProceedToSubmit = () => {
    window.location.href = '/delegate-login';
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Abstract Submission Guidelines
              </h1>
              <p className="text-lg text-gray-600">
                PEDICRITICON 2025, 27th November 2025 Conference of the IAP Intensive Care Chapter
              </p>
            </div>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Alert Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800">Important Notice</h3>
              <p className="text-red-700 text-sm">
                Abstract submission deadline has been extended to <strong>31st August 2025</strong>. 
                All guidelines below must be followed for successful submission.
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8 pt-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  General Abstract Guidelines
                </div>
              </button>
              <button
                onClick={() => setActiveTab('picu')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'picu'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Coffee className="h-4 w-4 mr-2" />
                  PICU Case Café
                </div>
              </button>
              <button
                onClick={() => setActiveTab('thesis')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'thesis'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Innovators of Tomorrow
                </div>
              </button>
              <button
                onClick={() => setActiveTab('radiology')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'radiology'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Radiology Case Contest
                </div>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* General Abstract Guidelines Tab */}
            {activeTab === 'general' && (
              <div>
                <div className="flex items-center mb-6">
                  <FileText className="h-6 w-6 text-blue-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    General Abstract Guidelines
                  </h2>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-4 mb-8">
                  <p className="text-red-800 font-semibold text-lg">
                    FOR AWARD PAPER PRESENTATION, ORIGINAL ARTICLES AND CASE REPORTS
                  </p>
                </div>

                {/* Core Requirements Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  
                  {/* Left Column - Essential Requirements */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Essential Requirements</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-blue-800">Prior Registration Mandatory</p>
                          <p className="text-blue-700 text-sm">Conference registration is required for presentation</p>
                        </div>
                      </div>

                      <div className="flex items-start p-4 bg-green-50 rounded-lg">
                        <FileText className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-800">Online Submission Only</p>
                          <p className="text-green-700 text-sm">Submit to conference website only. Include presenter details with abstract.</p>
                        </div>
                      </div>

                      <div className="flex items-start p-4 bg-red-50 rounded-lg">
                        <Clock className="h-5 w-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-800">Submission Deadline</p>
                          <p className="text-red-700 font-medium">Extended to 31st August 2025</p>
                        </div>
                      </div>

                      <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                        <Shield className="h-5 w-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-purple-800">Original Work Only</p>
                          <p className="text-purple-700 text-sm">Previously published/presented abstracts at National/International forums not permitted</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Word Limits & Time Allocation */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Specifications</h3>
                    
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Word Limits
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span className="text-sm font-medium text-black">Award Paper Presentation:</span>
                          <span className="font-bold text-blue-700">300 words</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span className="text-sm font-medium text-black">Original Articles:</span>
                          <span className="font-bold text-blue-700">300 words</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span className="text-sm font-medium text-black">Case Report:</span>
                          <span className="font-bold text-blue-700">300 words</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Time Allocation
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span className="text-sm font-medium text-green-600">Award Paper:</span>
                          <span className="font-bold text-green-700">6 min + 2 min discussion</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span className="text-sm font-medium text-green-600">Original Articles:</span>
                          <span className="font-bold text-green-700">5 min + 2 min discussion</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span className="text-sm font-medium text-green-600">Case Report:</span>
                          <span className="font-bold text-green-700">8 min + 2 min discussion</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Abstract Structure Requirements */}
                <div className="bg-yellow-50 p-6 rounded-lg mb-8">
                  <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Required Abstract Structure
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded">
                      <h4 className="font-medium text-yellow-700 mb-3">Original Article:</h4>
                      <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                        <li>Title (in Upper Case): Maximum 50 words</li>
                        <li>Background/ Introduction</li>
                        <li>Aim(s) of the Study</li>
                        <li>Methods</li>
                        <li>Results</li>
                        <li>Conclusion</li>
                        <li>Keywords</li>
                      </ol>
                    </div>
                    <div className="bg-white p-4 rounded">
                      <h4 className="font-medium text-yellow-700 mb-3">Case Report:</h4>
                      <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                        <li>Title (in Upper Case): Maximum 50 words</li>
                        <li>Background/ Introduction</li>
                        <li>Case Presentation</li>
                        <li>Discussion</li>
                        <li>Conclusion</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PICU Case Café Tab */}
            {activeTab === 'picu' && (
              <div>
                <div className="flex items-center mb-6">
                  <Coffee className="h-6 w-6 text-orange-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Guidelines for "PICU Case Café"
                  </h2>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-4 mb-8">
                  <p className="text-orange-800 font-semibold text-lg">
                    PediCritiCon 2025 (7th November 2025)
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Eligibility */}
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-orange-800 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Eligibility
                    </h3>
                    <ul className="text-sm text-orange-700 space-y-2">
                      <li>• Open to all members of the IAP Intensive Care Chapter</li>
                      <li>• Presentations are especially encouraged from fellows, DM/DrNB residents, and early-career intensivists</li>
                    </ul>
                  </div>

                  {/* Case Criteria */}
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Case Criteria
                    </h3>
                    <ul className="text-sm text-yellow-700 space-y-2">
                      <li>• Cases should be interesting, unusual, challenging, or educational in nature</li>
                      <li>• Only cases managed between July 2024 and August 2025 will be considered</li>
                    </ul>
                  </div>
                </div>

                {/* Submission Requirements */}
                <div className="bg-blue-50 p-6 rounded-lg mb-8">
                  <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Submission Requirements
                  </h3>
                  <p className="text-blue-700 mb-4">Submit a case summary (maximum 500 words) including:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded text-center">
                      <span className="text-blue-700 font-medium">Clinical presentation</span>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <span className="text-blue-700 font-medium">Diagnostic challenges</span>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <span className="text-blue-700 font-medium">Management strategies</span>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <span className="text-blue-700 font-medium">Outcome</span>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <span className="text-blue-700 font-medium">Key learning points</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                    <p className="text-red-700 text-sm font-medium">Patient identity must remain confidential.</p>
                  </div>
                </div>

                {/* Process Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Shortlisting
                    </h3>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li>• Cases will be reviewed and shortlisted by the scientific committee</li>
                      <li>• Shortlisted presenters will be invited to present during PediCritiCon 2025</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Presentation Format
                    </h3>
                    <ul className="text-sm text-purple-700 space-y-2">
                      <li>• Each presenter will have 12 minutes for the presentation, followed by 3 minutes for discussion</li>
                      <li>• Presentations should be case-focused, concise, and highlight practical learning points</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Innovators of Tomorrow Tab */}
            {activeTab === 'thesis' && (
              <div>
                <div className="flex items-center mb-6">
                  <GraduationCap className="h-6 w-6 text-purple-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Innovators of Tomorrow: Pediatric Critical Care DM/DrNB Thesis Awards
                  </h2>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 p-4 mb-8">
                  <p className="text-purple-800 font-semibold text-lg">
                    Guidelines for Best DM/DrNB Thesis Award in Pediatric Critical Care
                  </p>
                  <p className="text-purple-700 text-sm mt-1">
                    PediCritiCon 2025 (7th November 2025)
                  </p>
                </div>

                {/* Thesis Requirements */}
                <div className="bg-blue-50 p-6 rounded-lg mb-8">
                  <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Thesis Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="text-sm text-blue-700 space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        The Thesis must have been submitted to the respective university/institute in the last three years (30th June 2022 latest by 30th June 2025) and either should be approved or under process of approval in the respective university/institute.
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        The candidate should submit a letter from the HoD certifying that thesis is under process of approval.
                      </li>
                    </ul>
                    <ul className="text-sm text-blue-700 space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        Candidates should submit a manuscript based on their thesis work for consideration for the award.
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        The manuscript must be in the format of an original article, following the Indian Pediatrics "Instructions to Authors".
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Manuscript Guidelines */}
                <div className="bg-yellow-50 p-6 rounded-lg mb-8">
                  <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Manuscript Guidelines
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="text-sm text-yellow-700 space-y-2">
                      <li>• The manuscript should not exceed 2,500 words and may include a maximum of 25 references</li>
                      <li>• A one-page summary (maximum 500 words) should accompany the manuscript, highlighting why the thesis research merits the award</li>
                    </ul>
                    <ul className="text-sm text-yellow-700 space-y-2">
                      <li>• A certificate from the Head of the Department or Unit must be provided, confirming the thesis is the candidate's own work</li>
                      <li>• The thesis has been accepted by the university/institute or under process of approval</li>
                      <li>• There is no restriction on the number of entries submitted from any department or institution</li>
                    </ul>
                  </div>
                </div>

                {/* Important Notes for Thesis */}
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg mt-8">
                  <h3 className="font-semibold text-red-800 mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Important Certification Requirements
                  </h3>
                  <div className="bg-blue-800 text-white p-4 rounded-lg">
                    <p className="font-semibold mb-2">A certificate from the Head of the Department or Unit must be provided, confirming:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• The thesis is the candidate's own work</li>
                      <li>• The thesis has been accepted by the university/institute or under process of approval</li>
                      <li>• There is no restriction on the number of entries submitted from any department or institution</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Radiology Case Contest Tab */}
            {activeTab === 'radiology' && (
              <div>
                <div className="flex items-center mb-6">
                  <Image className="h-6 w-6 text-green-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Radiology Case Contest
                  </h2>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 p-4 mb-8">
                  <p className="text-green-800 font-semibold text-lg">
                    6th to 9th November 2025
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    @ Hyderabad International Convention Centre - HICC
                  </p>
                </div>

                {/* Eligibility and Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Eligibility */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Eligibility
                    </h3>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li>• Open to all members of the IAP Intensive Care Chapter</li>
                      <li>• Participation is especially encouraged from fellows, DM/DrNB residents, and early-career intensivists</li>
                    </ul>
                  </div>

                  {/* Case Requirements */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Case Requirements
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>• Cases must demonstrate clinically significant radiological findings with clear clinico-radiologic correlation</li>
                      <li>• Preference will be to unique, rare, or diagnostically challenging cases that offer strong educational value</li>
                      <li>• Cases must have been managed between July 2024 and August 2025</li>
                    </ul>
                  </div>
                </div>

                {/* Submission Guidelines */}
                <div className="bg-yellow-50 p-6 rounded-lg mb-8">
                  <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Submission Guidelines
                  </h3>
                  <p className="text-yellow-700 mb-4">Submit a case abstract limited to 500 words in PDF or Word format</p>
                </div>

                {/* Abstract Structure */}
                <div className="bg-purple-50 p-6 rounded-lg mb-8">
                  <h3 className="font-semibold text-purple-800 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Each abstract must include:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="text-sm text-purple-700 space-y-2">
                      <li>• A brief but unique past medical and social history</li>
                      <li>• A concise clinical course and management summary</li>
                      <li>• Key radiological images (e.g., X-ray, CT, MRI, ultrasound), embedded in the document and appropriately labeled</li>
                    </ul>
                    <ul className="text-sm text-purple-700 space-y-2">
                      <li>• Clinico-radiologic correlation and diagnosis</li>
                      <li>• Must not include any patient identifiers</li>
                    </ul>
                  </div>
                </div>

                {/* Important Details */}
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
                  <h3 className="font-semibold text-red-800 mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Other Important Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="text-sm text-red-700 space-y-2">
                      <li>• Only one case submission per participant is allowed</li>
                      <li>• Each institution may submit a maximum of three cases</li>
                      <li>• A mentor (consultant or faculty-level physician) must be associated with each submission</li>
                    </ul>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li>• All abstracts will undergo review, and a subset will be selected for presentation</li>
                      <li>• Selected participants will be notified and given further instructions to prepare a full case presentation with images for PediCritiCon 2025</li>
                      <li>• Patient consent must be appropriately obtained, and no patient-identifying information should appear in any submission or presentation</li>
                    </ul>
                  </div>
                </div>

                {/* Presentation Format */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Presentation Format
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li>• Selected participants will be invited to present during PediCritiCon 2025</li>
                    <li>• Each presenter will have 8 minutes for their case presentation, followed by 2 minutes of discussion</li>
                    <li>• Winners will be announced during the conference</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Process - Common for all */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Review Process (Common for All Categories)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                  <p className="text-sm text-gray-700">Karnataka Pedicriticon Scientific Committee will review all abstracts</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                  <p className="text-sm text-gray-700">Acceptance will be communicated to presenter</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                  <p className="text-sm text-gray-700">Selection is at sole discretion of Scientific Committee</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-1" />
                  <p className="text-sm text-gray-700">Committee may change presentation type after review</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-red-500 mr-2 mt-1" />
                  <p className="text-sm text-gray-700"><strong>Spot registrations NOT allowed for presenters</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-red-100 border border-red-300 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-red-800 mb-4">⚠️ Important Reminders</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-red-700 space-y-2">
                <li>• Guidelines are dynamic and may change from conference to conference</li>
                <li>• Ensure all presenter details are mentioned along with abstract</li>
                <li>• Conference registration is mandatory for participation</li>
              </ul>
              <ul className="text-sm text-red-700 space-y-2">
                <li>• Follow word limits strictly for successful submission</li>
                <li>• Use only approved file formats for uploads</li>
                <li>• Submit before deadline - no extensions after 31st August 2025</li>
              </ul>
            </div>
          </div>

          {/* Sample Abstract Reference */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Sample Abstract Format
            </h3>
            <p className="text-red-700 mb-4">
              Note: Templates will be uploaded once the abstract categories are finalised by the abstract committee.
            </p>
            <p className="text-blue-700 mb-4">
              Download sample abstract format for reference before submission:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download Sample Format
              </button>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Submit Your Abstract?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Please ensure you have read and understood all guidelines above. 
              You must be registered for the conference to proceed with abstract submission.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Before proceeding:</strong> Make sure you have your conference registration credentials ready. 
                If not registered yet, you can register first and then submit your abstract.
              </p>
            </div>
            
            <button
              onClick={handleProceedToSubmit}
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-lg shadow-md"
            >
              <Upload className="h-5 w-5 mr-2" />
              Click Here for Online Submission
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              You will be redirected to the delegate login page to authenticate your conference registration.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500">
          <p className="text-sm">
            <strong>Note:</strong> Guidelines are dynamic and may change from conference to conference
          </p>
          <p className="text-xs mt-2">
            © PEDICRITICON 2025, 6th to 9th November 2025, National Conference of the IAP Intensive Care Chapter |
            For queries: <a href="mailto:pedicriticon2025@gmail.com" className="text-blue-600 hover:underline">pedicriticon2025@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
