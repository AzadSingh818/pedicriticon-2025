'use client'
// src/app/admin/page.jsx - FIXED VERSION for PEDICRITICON 2025
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryWiseStatisticsTable, EnhancedAbstractTable, AbstractReviewModal } from '@/components/admin/AdminComponents'

export default function AdminDashboard() {
  const router = useRouter()
  
  // 👉 Authentication & Loading States
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  
  // 👉 Data States  
  const [abstracts, setAbstracts] = useState([])
  const [filteredAbstracts, setFilteredAbstracts] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  
  // 👉 FIXED: Correct category stats structure for all categories
  const [categoryStats, setCategoryStats] = useState({
    article: { total: 0, pending: 0, approved: 0, rejected: 0 },
    awardPaper: { total: 0, pending: 0, approved: 0, rejected: 0 },
    caseReport: { total: 0, pending: 0, approved: 0, rejected: 0 },
    poster: { total: 0, pending: 0, approved: 0, rejected: 0 },
    picuCafe: { total: 0, pending: 0, approved: 0, rejected: 0 },
    innovators: { total: 0, pending: 0, approved: 0, rejected: 0 },
    imaging: { total: 0, pending: 0, approved: 0, rejected: 0 }
  })
  
  // 👉 Filter & UI States
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedAbstract, setSelectedAbstract] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [showEmailTester, setShowEmailTester] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  // 👉 PEDICRITICON 2025 Categories - EXACT SCREENSHOT MATCH
  const PEDICRITICON_CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'Article', label: 'Article' },
    { value: 'Award Paper', label: 'Award Paper' },
    { value: 'Case Report', label: 'Case Report' },
    { value: 'Poster', label: 'Poster' },
    { value: 'PICU Case Cafe', label: 'PICU Case Cafe' },
    { value: 'Innovators of Tomorrow: Pediatric Critical Care DM/DrNB Thesis Awards', label: 'Innovators of Tomorrow: Pediatric Critical Care DM/DrNB Thesis Awards' },
    { value: 'PediCritiCon Imaging Honors: Clinico-Radiology Case Awards', label: 'PediCritiCon Imaging Honors: Clinico-Radiology Case Awards' }
  ]

  // 👉 FIXED: Auth Check with proper JWT secret
  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'GET',
          credentials: 'include'
        })
        
        console.log('🔍 Auth check response:', res.status)
        
        if (!res.ok) {
          console.log('❌ Auth failed, redirecting to login')
          router.replace('/admin/login')
          return
        }
        
        console.log('✅ Auth successful')
      } catch (error) {
        console.error('❌ Auth error:', error)
        router.replace('/admin/login')
        return
      } finally {
        setAuthLoading(false)
      }
    }
    verify()
  }, [router])

  // 👉 FIXED: Fetch Abstracts with proper API call
  useEffect(() => {
    if (!authLoading) {
      fetchAbstracts()
    }
  }, [authLoading])

  // 👉 FIXED: Search & Filter Logic
  useEffect(() => {
    let filtered = [...abstracts]
    
    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(abstract => 
        abstract.title?.toLowerCase().includes(search) ||
        abstract.author?.toLowerCase().includes(search) ||
        abstract.email?.toLowerCase().includes(search) ||
        abstract.affiliation?.toLowerCase().includes(search) ||
        abstract.abstractNumber?.toLowerCase().includes(search)
      )
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(abstract => abstract.status === statusFilter)
    }
    
    // Category filter  
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(abstract => 
        abstract.category === categoryFilter || 
        abstract.presentation_type === categoryFilter
      )
    }
    
    setFilteredAbstracts(filtered)
  }, [abstracts, searchTerm, statusFilter, categoryFilter])

  // 👉 FIXED: Calculate Category Stats with all 7 categories
  const calculateCategoryStats = (abstractsList) => {
    const stats = {
      article: { total: 0, pending: 0, approved: 0, rejected: 0 },
      awardPaper: { total: 0, pending: 0, approved: 0, rejected: 0 },
      caseReport: { total: 0, pending: 0, approved: 0, rejected: 0 },
      poster: { total: 0, pending: 0, approved: 0, rejected: 0 },
      picuCafe: { total: 0, pending: 0, approved: 0, rejected: 0 },
      innovators: { total: 0, pending: 0, approved: 0, rejected: 0 },
      imaging: { total: 0, pending: 0, approved: 0, rejected: 0 }
    }

    abstractsList.forEach(abstract => {
      let category = 'article' // default
      
      const type = (abstract.category || abstract.presentation_type || '').toLowerCase()
      
      if (type.includes('award') && !type.includes('thesis')) {
        category = 'awardPaper'
      } else if (type.includes('case') && type.includes('report')) {
        category = 'caseReport'
      } else if (type.includes('poster') && !type.includes('picu')) {
        category = 'poster'
      } else if (type.includes('picu') || type.includes('cafe')) {
        category = 'picuCafe'
      } else if (type.includes('innovators') || type.includes('thesis')) {
        category = 'innovators'
      } else if (type.includes('imaging') || type.includes('radiology')) {
        category = 'imaging'
      } else if (type.includes('article') || type.includes('original')) {
        category = 'article'
      }

      stats[category].total++
      if (abstract.status === 'pending') stats[category].pending++
      else if (abstract.status === 'approved') stats[category].approved++
      else if (abstract.status === 'rejected') stats[category].rejected++
    })

    return stats
  }

  // 👉 FIXED: Fetch function with better error handling
  const fetchAbstracts = async () => {
    try {
      console.log('🔄 Fetching abstracts from admin API...')
      
      const response = await fetch('/api/admin/abstracts', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 Response status:', response.status)
      
      if (response.status === 401) {
        console.log('❌ Unauthorized, redirecting to login')
        router.push('/admin/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Admin API Response received')
        
        // Handle different response formats
        const abstractsList = data.abstracts || data.data || []
        const statsData = data.stats || data.statistics || {}
        
        console.log('📊 Raw abstracts count:', abstractsList.length)
        
        // Map abstracts to proper format
        const mappedAbstracts = abstractsList.map(abstract => ({
          id: abstract.id,
          title: abstract.title,
          author: abstract.presenter_name || abstract.author,
          email: abstract.user_email || abstract.email,
          affiliation: abstract.institution_name || abstract.affiliation,
          category: abstract.category || abstract.presentation_type,
          presentation_type: abstract.presentation_type,
          submissionDate: abstract.submission_date || abstract.created_at,
          status: abstract.status || 'pending',
          abstract: abstract.abstract_content || abstract.abstract,
          mobile: abstract.mobile || abstract.phone,
          coAuthors: abstract.co_authors,
          registrationId: abstract.registration_id,
          abstractNumber: abstract.abstract_number,
          hasFile: abstract.hasFile || !!(abstract.file_name && abstract.file_path),
          file_name: abstract.file_name,
          file_path: abstract.file_path,
          file_size: abstract.file_size
        }))
        
        console.log('📋 Mapped abstracts:', mappedAbstracts.length)
        setAbstracts(mappedAbstracts)
        
        // Calculate stats
        const totalStats = {
          total: mappedAbstracts.length,
          pending: mappedAbstracts.filter(a => a.status === 'pending').length,
          approved: mappedAbstracts.filter(a => a.status === 'approved').length,
          rejected: mappedAbstracts.filter(a => a.status === 'rejected').length
        }
        
        setStats(totalStats)
        
        // Calculate category stats
        const calculatedCategoryStats = calculateCategoryStats(mappedAbstracts)
        setCategoryStats(calculatedCategoryStats)
        
        console.log('📊 Stats calculated:', { totalStats, calculatedCategoryStats })
      } else {
        console.error('❌ API Error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('❌ Error details:', errorText)
      }
    } catch (error) {
      console.error('❌ Error fetching abstracts:', error)
    } finally {
      setLoading(false)
    }
  }

  // 👉 Update Status Function
  const updateStatus = async (id, status) => {
    setUpdatingStatus(id)
    try {
      const response = await fetch('/api/admin/abstracts/status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        setAbstracts(prev => 
          prev.map(abstract => 
            abstract.id === id ? { ...abstract, status } : abstract
          )
        )
        
        // Update stats
        setStats(prev => {
          const newStats = { ...prev }
          const oldAbstract = abstracts.find(a => a.id === id)
          if (oldAbstract) {
            if (oldAbstract.status === 'pending') newStats.pending--
            else if (oldAbstract.status === 'approved') newStats.approved--
            else if (oldAbstract.status === 'rejected') newStats.rejected--
            
            if (status === 'approved') newStats.approved++
            else if (status === 'rejected') newStats.rejected++
            else if (status === 'pending') newStats.pending++
          }
          return newStats
        })
        
        // Recalculate category stats
        const updatedAbstracts = abstracts.map(abstract => 
          abstract.id === id ? { ...abstract, status } : abstract
        )
        const calculatedCategoryStats = calculateCategoryStats(updatedAbstracts)
        setCategoryStats(calculatedCategoryStats)
        
        setSelectedAbstract(null)
        setShowReviewModal(false)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  // 👉 Handle Functions
  const handleReviewUpdate = (reviewData) => {
    console.log('Review update:', reviewData)
    updateStatus(reviewData.abstractId, reviewData.status)
  }

  const handleSelectAbstract = (abstract) => {
    setSelectedAbstract(abstract)
    setShowReviewModal(true)
  }

  const handleLogout = () => {
    document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/admin/login')
  }

  const handleExportExcel = async (exportFilter = 'all') => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        format: 'excel',
        status: exportFilter === 'current' ? statusFilter : 'all',
        category: exportFilter === 'current' ? categoryFilter : 'all',
        includeStats: 'true'
      })

      const response = await fetch(`/api/export?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const contentDisposition = response.headers.get('content-disposition')
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `PEDICRITICON_Abstracts_${new Date().toISOString().split('T')[0]}.xlsx`

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        console.log(`✅ Excel exported: ${filename}`)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // 👉 BULK UPDATE FUNCTIONS
  const handleBulkStatusUpdate = async (abstractIds, status, comments = '') => {
    try {
      console.log('🔍 Bulk update called:', { abstractIds, status, comments })
      
      if (!abstractIds || abstractIds.length === 0) {
        alert('❌ Please select abstracts first')
        return { success: false, error: 'No abstracts selected' }
      }

      setLoading(true)
      
      const response = await fetch('/api/admin/abstracts/status', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abstractIds: Array.isArray(abstractIds) ? abstractIds : [abstractIds],
          status,
          comments,
          updatedBy: 'admin'
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        await fetchAbstracts() // Refresh data
        return { success: true }
      } else {
        throw new Error(data.error || 'Bulk update failed')
      }
    } catch (error) {
      console.error('❌ Bulk update error:', error)
      alert(`❌ Bulk Update Failed: ${error.message}`)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const handleBulkApprove = async (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) {
      alert('⚠️ Please select abstracts to approve')
      return
    }
    
    const comments = prompt('Enter approval comments (optional):') || 'Bulk approved'
    
    if (confirm(`Approve ${selectedIds.length} selected abstracts?`)) {
      return await handleBulkStatusUpdate(selectedIds, 'approved', comments)
    }
  }

  const handleBulkReject = async (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) {
      alert('⚠️ Please select abstracts to reject')
      return
    }
    
    const comments = prompt('Enter rejection reason (required):')
    
    if (!comments) {
      alert('❌ Rejection reason is required')
      return
    }
    
    if (confirm(`Reject ${selectedIds.length} selected abstracts?`)) {
      return await handleBulkStatusUpdate(selectedIds, 'rejected', comments)
    }
  }

  const handleIndividualApprove = async (abstractId, comments = '') => {
    const finalComments = comments || prompt('Enter approval comments (optional):') || 'Approved'
    
    if (confirm('Approve this abstract?')) {
      return await handleBulkStatusUpdate([abstractId], 'approved', finalComments)
    }
  }

  const handleIndividualReject = async (abstractId, comments = '') => {
    const finalComments = comments || prompt('Enter rejection reason (required):')
    
    if (!finalComments) {
      alert('❌ Rejection reason is required')
      return
    }
    
    if (confirm(`Reject this abstract?\n\nReason: ${finalComments}`)) {
      return await handleBulkStatusUpdate([abstractId], 'rejected', finalComments)
    }
  }

  // 👉 EMAIL & DOWNLOAD FUNCTIONS
  const handleIndividualEmail = async (abstract, emailType = 'custom') => {
    console.log('📧 Email function called for:', abstract.id)
    
    try {
      let emailData = {
        to: abstract.email,
        abstractId: abstract.id,
        type: emailType,
        abstract: {
          title: abstract.title,
          author: abstract.author,
          status: abstract.status,
          abstractNumber: abstract.abstractNumber || `ABST-${abstract.id}`
        }
      }

      if (emailType === 'custom') {
        const subject = prompt('Email Subject:', `Regarding your abstract: ${abstract.title}`)
        const message = prompt('Email Message:', 'Dear Author,\n\nRegarding your abstract submission...\n\nBest regards,\nPEDICRITICON 2025 Team')
        
        if (!subject || !message) {
          alert('Email cancelled - Subject and message are required')
          return
        }
        
        emailData = { ...emailData, subject, message }
      }

      const response = await fetch('/api/email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`✅ Email sent successfully to ${abstract.email}`)
      } else {
        throw new Error(result.error || 'Email sending failed')
      }
      
    } catch (error) {
      console.error('📧 Email error:', error)
      alert(`❌ Email failed: ${error.message}`)
    }
  }

  const handleIndividualDownload = async (abstract) => {
    console.log('📥 Download function called for:', abstract.id)
    
    try {
      if (!abstract.hasFile) {
        alert('❌ No file available for this abstract')
        return
      }

      const response = await fetch(`/api/abstracts/download/${abstract.id}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = abstract.file_name || `Abstract_${abstract.id}.pdf`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      console.log('✅ Download successful')
      
    } catch (error) {
      console.error('📥 Download error:', error)
      alert(`❌ Download failed: ${error.message}`)
    }
  }

  // 👉 UTILITY FUNCTIONS
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 👉 LOADING STATES
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PEDICRITICON admin dashboard...</p>
        </div>
      </div>
    )
  }

  // 👉 MAIN RENDER
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">PEDICRITICON 2025 - Conference Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowEmailTester(!showEmailTester)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📧 Email System
              </button>
              <button
                onClick={() => handleExportExcel('all')}
                disabled={exporting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {exporting ? '⏳ Exporting...' : '📊 Export Excel'}
              </button>
              <span className="text-sm text-gray-500">
                📊 Total: {stats.total} submissions
              </span>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white bg-black hover:bg-gray-800"
              >
                🏠 Main Site
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Tester */}
        {showEmailTester && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">📧 Email System Tester</h3>
            <EmailTestComponent />
          </div>
        )}

        {/* 👉 FIXED: Statistics Table with correct PEDICRITICON categories */}
        <CategoryWiseStatisticsTable stats={stats} categoryStats={categoryStats} />

        {/* 👉 FIXED: Abstract Review Interface with search and filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">📋 Abstract Review Interface</h3>
            <div className="text-sm text-gray-500">
              Showing: {filteredAbstracts.length} / {abstracts.length}
            </div>
          </div>
          
          {/* 👉 FIXED: Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <input
                type="text"
                placeholder="Search abstracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PEDICRITICON_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Files</option>
                <option value="with">With Files</option>
                <option value="without">Without Files</option>
              </select>
            </div>
          </div>

          {/* Enhanced Abstract Table */}
          <EnhancedAbstractTable 
            abstracts={filteredAbstracts}
            onSelectAbstract={handleSelectAbstract}
            onUpdateStatus={updateStatus}
            onSendEmail={handleIndividualEmail}
            onDownload={handleIndividualDownload}
            onApprove={handleIndividualApprove}
            onReject={handleIndividualReject}
            handleBulkStatusUpdate={handleBulkStatusUpdate}
            updatingStatus={updatingStatus}
          />
        </div>

        {/* Abstract Review Modal */}
        <AbstractReviewModal
          abstract={selectedAbstract}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedAbstract(null)
          }}
          onUpdateStatus={handleReviewUpdate}
        />
      </div>
    </div>
  )
}

// 👉 Email Test Component
function EmailTestComponent() {
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState('')
  const [emailConfig, setEmailConfig] = useState(null)

  const checkEmailConfig = async () => {
    try {
      const response = await fetch('/api/email?action=status')
      const data = await response.json()
      setEmailConfig(data)
    } catch (error) {
      console.error('Config check failed:', error)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      setResult('❌ Please enter an email address')
      return
    }

    setTesting(true)
    setResult('📤 Sending test email...')

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          data: { email: testEmail }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult('✅ Test email sent successfully! Check your inbox.')
      } else {
        setResult(`❌ Test email failed: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    checkEmailConfig()
  }, [])

  return (
    <div className="space-y-4">
      {emailConfig && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Email Configuration Status:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Service: <span className={emailConfig.configuration?.service !== 'Not configured' ? 'text-green-600' : 'text-red-600'}>{emailConfig.configuration?.service || 'Not configured'}</span></div>
            <div>User: <span className={emailConfig.configuration?.user === 'Configured' ? 'text-green-600' : 'text-red-600'}>{emailConfig.configuration?.user || 'Not configured'}</span></div>
          </div>
          <div className="mt-2">
            <span className={`font-medium ${emailConfig.ready ? 'text-green-600' : 'text-red-600'}`}>
              {emailConfig.ready ? '✅ Email system ready' : '❌ Email system not configured'}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Email Address:
        </label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email address"
        />
      </div>

      <button
        onClick={sendTestEmail}
        disabled={testing || !testEmail}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {testing ? '📤 Sending...' : '📧 Send Test Email'}
      </button>

      {result && (
        <div className={`p-3 rounded-lg text-sm ${
          result.includes('✅') ? 'bg-green-100 text-green-700' : 
          result.includes('❌') ? 'bg-red-100 text-red-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {result}
        </div>
      )}

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">📋 Quick Setup Guide:</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>1. Add email settings to <code>.env.local</code></p>
          <p>2. For Gmail: Enable 2FA and create App Password</p>
          <p>3. Set EMAIL_USER and EMAIL_PASS variables</p>
          <p>4. Test the email system above</p>
        </div>
      </div>
    </div>
  )
}