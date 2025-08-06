// src/app/api/abstracts/user/route.js
// 🚀 ENHANCED VERSION - Category support with auto-migration

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { 
  getUserAbstracts, 
  testConnection, 
  initializeDatabase, // 🚀 NEW: Add this import
  migrateCategoryColumn,
  getFilesByAbstractId
} from '@/lib/database-postgres';

// Extract user from JWT token
function getUserFromToken(authHeader) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

// 🚀 NEW: Enhanced database preparation
async function ensureDatabaseReady() {
  try {
    await testConnection();
    console.log('✅ Database connection successful');
    
    // 🚀 NEW: Auto-run migration check for user routes
    await initializeDatabase();
    console.log('✅ Database initialization complete for user routes');
    
    return true;
  } catch (error) {
    console.error('❌ Database setup failed in user route:', error);
    throw error;
  }
}

// 🚀 ENHANCED: GET - Fetch user's abstracts with migration check
export async function GET(request) {
  try {
    // 🚀 ENHANCED: Ensure database is ready with migration
    await ensureDatabaseReady();

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify user token
    const user = getUserFromToken(authHeader);
    console.log('🔍 Fetching abstracts for user:', user.email, 'ID:', user.userId);

    // Get user's abstracts from PostgreSQL
    // 1️⃣ pull the abstracts the way you already do
const rawAbstracts = await getUserAbstracts(user.userId);

// 2️⃣ attach every uploaded file to its abstract
const userAbstracts = await Promise.all(
  rawAbstracts.map(async (ab) => {
    const files = await getFilesByAbstractId(ab.id);
    return {
      ...ab,
      files,                 // full array for the front‑end
      hasFile: files.length > 0 || !!(ab.file_name && ab.file_path),

      /* optional backward‑compat aliases */
      file_name: ab.file_name || files[0]?.file_name || null,
      file_path: ab.file_path || files[0]?.file_path || null,
      file_size: ab.file_size || files[0]?.file_size || null,
    };
  })
);

    // 🚀 ENHANCED: Calculate user stats with proper category distribution
    const stats = {
      total: userAbstracts.length,
      pending: userAbstracts.filter(a => a.status === 'pending').length,
      approved: userAbstracts.filter(a => a.status === 'approved').length,
      rejected: userAbstracts.filter(a => a.status === 'rejected').length,
      final_submitted: userAbstracts.filter(a => a.status === 'final_submitted').length,
      
      // 🚀 NEW: Add category-wise breakdown for user
      byCategory: {
        Fellow: userAbstracts.filter(a => (a.category || 'Fellow').toLowerCase() === 'Fellow').length,
        Postgraduate: userAbstracts.filter(a => (a.category || 'Postgraduate').toLowerCase() === 'Postgraduate').length,
        Nurse: userAbstracts.filter(a => (a.category || 'Nurse').toLowerCase() === 'Nurse').length,
        opencategory: userAbstracts.filter(a => (a.category || 'open category').toLowerCase() === 'open category').length,
        //hsct: userAbstracts.filter(a => (a.category || 'Hematology').toLowerCase() === 'hsct').length
      }
    };

    console.log(`📊 User ${user.email} has ${userAbstracts.length} abstracts`);
    
    // 🚀 NEW: Log category distribution for debugging
    console.log('📊 User abstracts by category:', stats.byCategory);

    // 🚀 ENHANCED: Better response with category information
    return NextResponse.json({
      success: true,
      abstracts: userAbstracts.map(abstract => ({
        ...abstract,
        // 🚀 Ensure category always exists in response
        category: abstract.category || 'Hematology',
        categoryType: abstract.category || 'Hematology',
        hasFile: !!(abstract.file_name && abstract.file_path)
      })),
      stats,
      user: {
        email: user.email,
        name: user.name,
        id: user.userId
      },
      
      // 🚀 NEW: Add metadata for debugging
      metadata: {
        timestamp: new Date().toISOString(),
        databaseReady: true,
        categorySupported: true
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user abstracts:', error);
    
    if (error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch abstracts',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// 🚀 ENHANCED: POST with migration check
export async function POST(request) {
  try {
    // 🚀 ENHANCED: Ensure database is ready
    await ensureDatabaseReady();

    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify user token
    const user = getUserFromToken(authHeader);
    const submissionData = await request.json();

    console.log('📝 User submission from:', user.email);
    console.log('📝 Submission category:', submissionData.category); // 🚀 NEW: Log category

    // Forward to main abstracts API with user context
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/abstracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader // Pass through authorization
      },
      body: JSON.stringify(submissionData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ User submission successful for:', user.email);
      console.log('✅ Abstract created with category:', result.abstract?.category); // 🚀 NEW
      return NextResponse.json(result);
    } else {
      throw new Error(result.message || result.error || 'Submission failed');
    }

  } catch (error) {
    console.error('❌ User submission error:', error);
    
    if (error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to submit abstract',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// 🚀 ENHANCED: PUT with migration check
export async function PUT(request) {
  try {
    // 🚀 ENHANCED: Ensure database is ready
    await ensureDatabaseReady();

    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify user token
    const user = getUserFromToken(authHeader);
    const updateData = await request.json();

    if (!updateData.id) {
      return NextResponse.json(
        { error: 'Abstract ID is required' },
        { status: 400 }
      );
    }

    console.log('🔄 User updating abstract:', updateData.id, 'by:', user.email);
    console.log('📝 Update category:', updateData.category); // 🚀 NEW: Log category

    // Forward to main abstracts API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/abstracts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader // Pass through authorization
      },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ User update successful for:', user.email);
      console.log('✅ Abstract updated with category:', result.abstract?.category); // 🚀 NEW
      return NextResponse.json(result);
    } else {
      throw new Error(result.message || result.error || 'Update failed');
    }

  } catch (error) {
    console.error('❌ Error updating user abstract:', error);
    
    if (error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update abstract',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// 🚀 ENHANCED: DELETE with migration check
export async function DELETE(request) {
  try {
    // 🚀 ENHANCED: Ensure database is ready
    await ensureDatabaseReady();

    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify user token
    const user = getUserFromToken(authHeader);
    
    const url = new URL(request.url);
    const abstractId = url.searchParams.get('id');

    if (!abstractId) {
      return NextResponse.json(
        { error: 'Abstract ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ User deleting abstract:', abstractId, 'by:', user.email);

    // Forward to main abstracts API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/abstracts?id=${abstractId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader // Pass through authorization
      }
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ User deletion successful for:', user.email);
      return NextResponse.json(result);
    } else {
      throw new Error(result.message || result.error || 'Deletion failed');
    }

  } catch (error) {
    console.error('❌ Error deleting user abstract:', error);
    
    if (error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete abstract',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}