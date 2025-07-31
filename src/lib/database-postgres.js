// src/lib/database-postgres.js
// 🚀 Database functions with category support and auto-migration

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Check if category column exists
async function checkCategoryColumnExists(client) {
  try {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'abstracts' AND column_name = 'category'
    `;
    const result = await client.query(query);
    const exists = result.rows.length > 0;
    console.log(`📊 Category column exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('❌ Error checking category column:', error);
    return false;
  }
}

// 🚀 NEW: Auto-migration function to add category column
export async function migrateCategoryColumn() {
  const client = await pool.connect();
  try {
    console.log('🔄 Checking category column migration...');
    
    // Check if category column exists
    const columnExists = await checkCategoryColumnExists(client);
    
    if (!columnExists) {
      console.log('⚠️ Category column missing - performing migration...');
      
      // Add category column
      await client.query(`
        ALTER TABLE abstracts 
        ADD COLUMN category VARCHAR(50) DEFAULT 'Hematology'
      `);
      
      // Update existing records
      await client.query(`
        UPDATE abstracts 
        SET category = 'Hematology' 
        WHERE category IS NULL
      `);
      
      // Add index for performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_abstracts_category ON abstracts(category)
      `);
      
      console.log('✅ Category column migration completed successfully!');
      return true;
    } else {
      console.log('✅ Category column already exists - no migration needed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Category column migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ========================================
// USER MANAGEMENT FUNCTIONS
// ========================================

export async function createUser(userData) {
  const client = await pool.connect();
  try {
    console.log('🔄 Creating user:', userData.email);
    
    const query = `
      INSERT INTO users (email, password, full_name, institution, phone, registration_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, email, full_name, institution, phone, registration_id, created_at
    `;
    
    const values = [
      userData.email,
      userData.password,
      userData.full_name,
      userData.institution || null,
      userData.phone || null,
      userData.registration_id || null
    ];
    
    const result = await client.query(query, values);
    console.log('✅ User created successfully:', result.rows[0].id);
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getUserByEmail(email) {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error getting user by email:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getUserById(userId) {
  const client = await pool.connect();
  try {
    // Convert to integer if string
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    if (isNaN(id)) {
      throw new Error('Invalid user ID provided');
    }
    
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await client.query(query, [id]);
    
    console.log(`📊 User ${id} lookup:`, result.rows.length > 0 ? 'Found' : 'Not found');
    return result.rows[0] || null;
    
  } catch (error) {
    console.error('❌ Error getting user by ID:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ========================================
// ABSTRACT MANAGEMENT WITH CATEGORY SUPPORT
// ========================================

export async function createAbstract(abstractData) {
  const client = await pool.connect();
  try {
    console.log('🔄 Creating abstract for user:', abstractData.user_id);
    console.log('📝 Abstract category:', abstractData.category);
    
    // 🚀 ENSURE CATEGORY COLUMN EXISTS BEFORE CREATING
    await migrateCategoryColumn();
    
    // Check if category column exists
    const hasCategoryColumn = await checkCategoryColumnExists(client);
    
    // Generate unique abstract number
    const abstractNumber = `ABST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    let query, values;
    
    if (hasCategoryColumn) {
      // NEW SCHEMA: Include category field
      console.log('✅ Using schema with category column');
      query = `
        INSERT INTO abstracts (
          user_id, title, presenter_name, institution_name, presentation_type,
          category, abstract_content, co_authors, file_path, file_name, file_size,
          status, abstract_number, registration_id, submission_date, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
      `;
      
      values = [
        abstractData.user_id,
        abstractData.title,
        abstractData.presenter_name,
        abstractData.institution_name || null,
        abstractData.presentation_type,
        abstractData.category || 'Hematology',
        abstractData.abstract_content,
        abstractData.co_authors || null,
        abstractData.file_path || null,
        abstractData.file_name || null,
        abstractData.file_size || null,
        'pending',
        abstractNumber,
        abstractData.registration_id || null
      ];
    } else {
      // BACKWARD COMPATIBILITY: Old schema without category
      console.log('⚠️ Using legacy schema without category column');
      query = `
        INSERT INTO abstracts (
          user_id, title, presenter_name, institution_name, presentation_type,
          abstract_content, co_authors, file_path, file_name, file_size,
          status, abstract_number, registration_id, submission_date, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        RETURNING *
      `;
      
      values = [
        abstractData.user_id,
        abstractData.title,
        abstractData.presenter_name,
        abstractData.institution_name || null,
        abstractData.presentation_type,
        abstractData.abstract_content,
        abstractData.co_authors || null,
        abstractData.file_path || null,
        abstractData.file_name || null,
        abstractData.file_size || null,
        'pending',
        abstractNumber,
        abstractData.registration_id || null
      ];
    }
    
    const result = await client.query(query, values);
    
    // Add default category to response if column doesn't exist
    if (!hasCategoryColumn && result.rows[0]) {
      result.rows[0].category = abstractData.category || 'Hematology';
    }
    
    console.log('✅ Abstract created successfully:', result.rows[0].id);
    console.log('📝 Category saved:', result.rows[0].category || 'N/A (legacy mode)');
    
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Error creating abstract:', error);
    console.error('📊 Full error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      position: error.position
    });
    throw error;
  } finally {
    client.release();
  }
}

// 🚀 ENHANCED: getUserAbstracts with better category handling
export async function getUserAbstracts(userId) {
  const client = await pool.connect();
  try {
    // Convert to integer if string
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    if (isNaN(id)) {
      throw new Error('Invalid user ID provided');
    }
    
    console.log(`🔄 Getting abstracts for user ${id}...`);
    
    // 🚀 ENSURE MIGRATION FIRST
    await migrateCategoryColumn();
    
    // Check if category column exists
    const hasCategoryColumn = await checkCategoryColumnExists(client);
    
    let query;
    if (hasCategoryColumn) {
      query = `
        SELECT 
          id, title, presenter_name, institution_name, presentation_type,
          category, abstract_content, co_authors, status, abstract_number,
          registration_id, submission_date, updated_at, reviewer_comments,
          file_path, file_name, file_size
        FROM abstracts 
        WHERE user_id = $1 
        ORDER BY submission_date DESC
      `;
    } else {
      query = `
        SELECT 
          id, title, presenter_name, institution_name, presentation_type,
          abstract_content, co_authors, status, abstract_number,
          registration_id, submission_date, updated_at, reviewer_comments,
          file_path, file_name, file_size
        FROM abstracts 
        WHERE user_id = $1 
        ORDER BY submission_date DESC
      `;
    }
    
    const result = await client.query(query, [id]);
    
    // 🚀 ENHANCED: Better category mapping with proper defaults
    const abstracts = result.rows.map(abstract => ({
      ...abstract,
      category: abstract.category || 'Hematology', // Ensure category always exists
      categoryType: abstract.category || 'Hematology', // Additional mapping for frontend
      hasFile: !!(abstract.file_name && abstract.file_path)
    }));
    
    console.log(`📊 Found ${abstracts.length} abstracts for user ${id}`);
    
    // 🚀 NEW: Log category distribution for debugging
    const categoryStats = abstracts.reduce((acc, abstract) => {
      acc[abstract.category] = (acc[abstract.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 User abstracts by category:', categoryStats);
    
    return abstracts;
    
  } catch (error) {
    console.error('❌ Error getting user abstracts:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getAbstractsByUserId(userId) {
  console.log('🔄 getAbstractsByUserId called for user:', userId);
  return await getUserAbstracts(userId);
}

// ✅ ENHANCED: getAllAbstracts with file information for download
export async function getAllAbstracts() {
  const client = await pool.connect();
  try {
    // 🚀 ENSURE MIGRATION FIRST
    await migrateCategoryColumn();
    
    // Check if category column exists
    const hasCategoryColumn = await checkCategoryColumnExists(client);
    
    let query;
    if (hasCategoryColumn) {
      query = `
        SELECT 
          a.id, a.title, a.presenter_name, a.institution_name, a.presentation_type,
          a.category, a.abstract_content, a.co_authors, a.status, a.abstract_number,
          a.registration_id, a.submission_date, a.updated_at, a.reviewer_comments,
          a.file_path, a.file_name, a.file_size,
          u.email, u.phone, u.full_name as user_full_name
        FROM abstracts a 
        LEFT JOIN users u ON a.user_id = u.id 
        ORDER BY a.submission_date DESC
      `;
    } else {
      // Legacy query without category
      query = `
        SELECT 
          a.id, a.title, a.presenter_name, a.institution_name, a.presentation_type,
          a.abstract_content, a.co_authors, a.status, a.abstract_number,
          a.registration_id, a.submission_date, a.updated_at, a.reviewer_comments,
          a.file_path, a.file_name, a.file_size,
          u.email, u.phone, u.full_name as user_full_name
        FROM abstracts a 
        LEFT JOIN users u ON a.user_id = u.id 
        ORDER BY a.submission_date DESC
      `;
    }
    
    const result = await client.query(query);
    console.log(`📊 Retrieved ${result.rows.length} total abstracts`);
    
    // Map database fields with category compatibility
    const mappedAbstracts = result.rows.map((abstract, index) => ({
      // Core fields
      id: abstract.id,
      title: abstract.title || 'Untitled',
      
      // Multiple name mappings for presenter
      presenter_name: abstract.presenter_name || 'Unknown',
      author: abstract.presenter_name || 'Unknown',
      
      // Multiple email mappings
      email: abstract.email || 'N/A',
      
      // Multiple phone/mobile mappings
      phone: abstract.phone || 'N/A',
      mobile_no: abstract.phone || 'N/A',
      mobile: abstract.phone || 'N/A',
      
      // Multiple title mappings
      abstract_title: abstract.title || 'Untitled',
      
      // Multiple co-author mappings
      co_authors: abstract.co_authors || 'N/A',
      coAuthors: abstract.co_authors || 'N/A',
      
      // Multiple institution mappings
      institution_name: abstract.institution_name || 'N/A',
      institution: abstract.institution_name || 'N/A',
      affiliation: abstract.institution_name || 'N/A',
      
      // Multiple registration ID mappings
      registration_id: abstract.registration_id || 'N/A',
      registrationId: abstract.registration_id || 'N/A',
      
      // Status with safe operations
      status: abstract.status || 'pending',
      
      // Multiple presentation type mappings
      presentation_type: abstract.presentation_type || 'Free Paper',
      
      // Category with fallback for legacy records
      category: abstract.category || 'Hematology', // Default for legacy records
      categoryType: abstract.category || 'Hematology',
      
      // Multiple abstract number mappings
      abstract_number: abstract.abstract_number || `ABST-${String(index + 1).padStart(3, '0')}`,
      abstractNumber: abstract.abstract_number || `ABST-${String(index + 1).padStart(3, '0')}`,
      
      // Multiple date mappings
      submission_date: abstract.submission_date,
      submissionDate: abstract.submission_date,
      updated_at: abstract.updated_at,
      
      // Other fields
      reviewer_comments: abstract.reviewer_comments,
      
      // ✅ ENHANCED: File fields for download functionality
      file_path: abstract.file_path,
      file_name: abstract.file_name,
      fileName: abstract.file_name,
      file_size: abstract.file_size,
      fileSize: abstract.file_size,
      
      // Multiple abstract content mappings
      abstract_content: abstract.abstract_content || '',
      abstract: abstract.abstract_content || '',
      
      // Safe string operations for filtering
      statusLower: (abstract.status || 'pending').toLowerCase(),
      presentationTypeLower: (abstract.presentation_type || 'free paper').toLowerCase(),
      categoryLower: (abstract.category || 'hematology').toLowerCase(),
      
      // Additional computed fields
      hasFile: !!(abstract.file_path || abstract.file_name),
      
      // Indicate if this is legacy data
      isLegacyRecord: !abstract.category
    }));
    
    return mappedAbstracts;
    
  } catch (error) {
    console.error('❌ Error getting all abstracts:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ✅ ENHANCED: getAbstractById with file information for download
export async function getAbstractById(abstractId) {
  const client = await pool.connect();
  try {
    // Convert to integer if string, but also handle string IDs
    let id = abstractId;
    if (typeof abstractId === 'string' && /^\d+$/.test(abstractId)) {
      id = parseInt(abstractId, 10);
    }
    
    console.log(`🔍 Looking up abstract with ID: ${id} (type: ${typeof id})`);
    
    // Try both integer and string ID formats
    const queries = [
      `
        SELECT a.*, u.email, u.phone, u.full_name as user_full_name
        FROM abstracts a 
        LEFT JOIN users u ON a.user_id = u.id 
        WHERE a.id = $1
      `,
      `
        SELECT a.*, u.email, u.phone, u.full_name as user_full_name
        FROM abstracts a 
        LEFT JOIN users u ON a.user_id = u.id 
        WHERE CAST(a.id AS TEXT) = $1
      `
    ];
    
    let result = null;
    
    // Try with the original ID first
    for (const query of queries) {
      try {
        result = await client.query(query, [id]);
        if (result.rows.length > 0) {
          console.log(`✅ Abstract found using query type: ${typeof id}`);
          break;
        }
      } catch (queryError) {
        console.log(`⚠️ Query failed with ID ${id}:`, queryError.message);
      }
    }
    
    if (!result || result.rows.length === 0) {
      console.log(`❌ Abstract ${id} not found in database`);
      return null;
    }
    
    const abstract = result.rows[0];
    
    // Add default category if missing (legacy record)
    if (!abstract.category) {
      abstract.category = 'Hematology';
    }
    
    // ✅ Enhanced mapping for download functionality
    const enhancedAbstract = {
      ...abstract,
      
      // Ensure all required fields for download
      id: abstract.id,
      title: abstract.title || 'Untitled',
      presenter_name: abstract.presenter_name || 'Unknown',
      author: abstract.presenter_name || 'Unknown',
      email: abstract.email || 'N/A',
      
      // File information for download
      file_path: abstract.file_path,
      file_name: abstract.file_name,
      file_size: abstract.file_size,
      hasFile: !!(abstract.file_path || abstract.file_name),
      
      // Additional mappings
      abstract_number: abstract.abstract_number,
      submission_date: abstract.submission_date,
      category: abstract.category || 'Hematology'
    };
    
    console.log(`📊 Abstract ${id} details:`, {
      id: enhancedAbstract.id,
      title: enhancedAbstract.title,
      category: enhancedAbstract.category,
      file_name: enhancedAbstract.file_name,
      file_path: enhancedAbstract.file_path,
      hasFile: enhancedAbstract.hasFile
    });
    
    return enhancedAbstract;
    
  } catch (error) {
    console.error('❌ Error getting abstract by ID:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateAbstractStatus(abstractId, status, comments = null) {
  const client = await pool.connect();
  try {
    // Convert to integer if string
    const id = typeof abstractId === 'string' ? parseInt(abstractId, 10) : abstractId;
    
    if (isNaN(id)) {
      throw new Error('Invalid abstract ID provided');
    }
    
    console.log(`🔄 Updating abstract ${id} status to: ${status}`);
    
    const query = `
      UPDATE abstracts 
      SET status = $1, reviewer_comments = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await client.query(query, [status, comments, id]);
    
    if (result.rows.length === 0) {
      throw new Error(`Abstract with ID ${id} not found`);
    }
    
    console.log('✅ Abstract status updated successfully');
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Error updating abstract status:', error);
    throw error;
  } finally {
    client.release();
  }
}

// BULK UPDATE FUNCTION
export async function bulkUpdateAbstractStatus(abstractIds, status, comments = null) {
  const client = await pool.connect();
  
  try {
    console.log(`🔄 [PostgreSQL] Bulk updating ${abstractIds.length} abstracts to status: ${status}`);
    
    // Convert all IDs to integers and validate
    const validIds = abstractIds.map(id => {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(numId)) {
        throw new Error(`Invalid abstract ID: ${id}`);
      }
      return numId;
    });
    
    console.log('📊 Valid IDs to update:', validIds);
    
    // Start transaction for atomicity
    await client.query('BEGIN');
    
    // Build query with proper parameterization
    const placeholders = validIds.map((_, index) => `$${index + 1}`).join(',');
    const query = `
      UPDATE abstracts 
      SET status = $${validIds.length + 1}, 
          reviewer_comments = $${validIds.length + 2}, 
          updated_at = NOW()
      WHERE id IN (${placeholders})
      RETURNING id, title, status, presenter_name, updated_at
    `;
    
    const values = [...validIds, status, comments];
    console.log('🔄 Executing bulk update query...');
    
    const result = await client.query(query, values);
    
    // Commit transaction
    await client.query('COMMIT');
    
    const updatedCount = result.rows.length;
    console.log(`✅ [PostgreSQL] Successfully updated ${updatedCount} abstracts in bulk`);
    
    return result.rows;
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    
    console.error('❌ [PostgreSQL] Bulk update error:', error);
    throw error;
    
  } finally {
    client.release();
  }
}

export async function updateAbstract(abstractId, updateData) {
  const client = await pool.connect();
  try {
    // Convert to integer if string
    const id = typeof abstractId === 'string' ? parseInt(abstractId, 10) : abstractId;
    
    if (isNaN(id)) {
      throw new Error('Invalid abstract ID provided');
    }
    
    console.log(`🔄 Updating abstract ${id} with data:`, Object.keys(updateData));
    
    // 🚀 ENSURE MIGRATION FIRST
    await migrateCategoryColumn();
    
    // Check if category column exists
    const hasCategoryColumn = await checkCategoryColumnExists(client);
    
    // Build dynamic query based on provided fields
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    // Handle each possible update field
    let allowedFields = [
      'title', 'presenter_name', 'institution_name', 'presentation_type',
      'abstract_content', 'co_authors', 'file_path', 'file_name', 
      'file_size', 'status', 'reviewer_comments', 'final_file_path'
    ];
    
    // Only include category if column exists
    if (hasCategoryColumn) {
      allowedFields.push('category');
    }
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    }
    
    if (updateFields.length === 0) {
      throw new Error('No valid fields provided for update');
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    // Add the ID parameter at the end
    values.push(id);
    
    const query = `
      UPDATE abstracts 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Abstract with ID ${id} not found`);
    }
    
    // Add default category if missing
    if (!hasCategoryColumn && result.rows[0]) {
      result.rows[0].category = updateData.category || 'Hematology';
    }
    
    console.log('✅ Abstract updated successfully');
    console.log('📝 Category support:', hasCategoryColumn ? 'Enabled' : 'Legacy mode');
    
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Error updating abstract:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteAbstract(abstractId) {
  const client = await pool.connect();
  try {
    // Convert to integer if string
    const id = typeof abstractId === 'string' ? parseInt(abstractId, 10) : abstractId;
    
    if (isNaN(id)) {
      throw new Error('Invalid abstract ID provided');
    }
    
    console.log(`🔄 Deleting abstract ${id}`);
    
    const query = 'DELETE FROM abstracts WHERE id = $1 RETURNING *';
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error(`Abstract with ID ${id} not found`);
    }
    
    console.log('✅ Abstract deleted successfully');
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Error deleting abstract:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ========================================
// STATISTICS AND REPORTING
// ========================================

export async function getStatistics() {
  const client = await pool.connect();
  try {
    console.log('🔄 Fetching statistics...');
    
    // 🚀 ENSURE MIGRATION FIRST
    await migrateCategoryColumn();
    
    // Check if category column exists for statistics
    const hasCategoryColumn = await checkCategoryColumnExists(client);
    
    let query;
    if (hasCategoryColumn) {
      query = `
        SELECT 
          presentation_type,
          category,
          COUNT(*) as total_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
        FROM abstracts 
        GROUP BY presentation_type, category
        ORDER BY presentation_type, category
      `;
    } else {
      // Legacy statistics without category
      query = `
        SELECT 
          presentation_type,
          'Hematology' as category,
          COUNT(*) as total_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
        FROM abstracts 
        GROUP BY presentation_type
        ORDER BY presentation_type
      `;
    }
    
    const result = await client.query(query);
    
    // Also get overall totals
    const totalQuery = `
      SELECT 
        COUNT(*) as total_abstracts,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as total_pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as total_approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as total_rejected,
        COUNT(CASE WHEN status = 'final_submitted' THEN 1 END) as total_final_submitted,
        COUNT(DISTINCT user_id) as total_users
      FROM abstracts
    `;
    
    const totalResult = await client.query(totalQuery);
    
    console.log('✅ Statistics retrieved successfully');
    console.log('📊 Category support in stats:', hasCategoryColumn ? 'Enabled' : 'Legacy mode');
    
    return {
      byCategory: result.rows,
      totals: totalResult.rows[0],
      hasCategorySupport: hasCategoryColumn
    };
    
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL connection test successful');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection test failed:', error);
    throw error;
  }
}

// 🚀 ENHANCED: initializeDatabase with auto-migration
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Checking database tables...');
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'abstracts')
    `;
    
    const result = await client.query(tablesQuery);
    const existingTables = result.rows.map(row => row.table_name);
    
    if (existingTables.includes('users') && existingTables.includes('abstracts')) {
      console.log('✅ Database tables exist and ready');
      
      // 🚀 NEW: Auto-migrate category column if missing
      try {
        await migrateCategoryColumn();
      } catch (migrationError) {
        console.error('⚠️ Migration warning:', migrationError);
      }
      
      // Final check
      const hasCategoryColumn = await checkCategoryColumnExists(client);
      
      if (!hasCategoryColumn) {
        console.log('⚠️ Category column still missing - manual intervention required');
        console.log('📝 Please run: ALTER TABLE abstracts ADD COLUMN category VARCHAR(50) DEFAULT \'Hematology\';');
      } else {
        console.log('✅ Category column exists - full feature support enabled');
      }
      
      return true;
    } else {
      console.log('⚠️ Some tables missing. Database needs setup.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all uploaded files linked to a specific abstract
export async function getFilesByAbstractId(abstractId) {
  const result = await pool.query(
    `SELECT file_name, file_path, file_size FROM uploaded_files WHERE abstract_id = $1`,
    [abstractId]
  );
  return result.rows;
}

export async function saveUploadedFile(fileData) {
  const { abstract_id, file_name, file_path, file_size } = fileData;
  await pool.query(
    `INSERT INTO uploaded_files (abstract_id, file_name, file_path, file_size)
     VALUES ($1, $2, $3, $4)`,
    [abstract_id, file_name, file_path, file_size]
  );
}

export async function closePool() {
  try {
    await pool.end();
    console.log('✅ Database pool closed');
  } catch (error) {
    console.error('❌ Error closing pool:', error);
    throw error;
  }
}

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

export function handleDatabaseError(error, operation) {
  console.error(`❌ Database error during ${operation}:`, {
    message: error.message,
    code: error.code,
    detail: error.detail,
    hint: error.hint
  });
  
  // Return user-friendly error messages
  if (error.code === '23505') { // Unique violation
    return new Error('A record with this information already exists');
  } else if (error.code === '23503') { // Foreign key violation
    return new Error('Referenced record not found');
  } else if (error.code === '23502') { // Not null violation
    return new Error('Required field is missing');
  } else if (error.code === '42703') { // Undefined column
    return new Error('Database schema mismatch - please contact administrator');
  } else {
    return new Error(`Database operation failed: ${error.message}`);
  }
}

// Export pool for direct access if needed
export { pool };

// DEFAULT EXPORT WITH BACKWARD COMPATIBILITY AND CATEGORY SUPPORT
export default {
  // User functions
  createUser,
  getUserByEmail,
  getUserById,
  
  // Abstract functions with category compatibility and download support
  createAbstract,
  getAbstractsByUserId,
  getUserAbstracts,
  getAllAbstracts,
  getAbstractById,
  updateAbstractStatus,
  bulkUpdateAbstractStatus,
  updateAbstract,
  deleteAbstract,
  getFilesByAbstractId,
  saveUploadedFile,
  
  // Statistics and utilities
  getStatistics,
  testConnection,
  initializeDatabase,
  closePool,
  handleDatabaseError,
  
  // 🚀 NEW: Migration utilities
  checkCategoryColumnExists,
  migrateCategoryColumn,
  
  // Direct pool access
  pool
};