// src/lib/database-postgres.js





// 🚀 FIXED Database configuration for Neon PostgreSQL

import { Pool } from 'pg';

// 🚀 ENHANCED: Better connection configuration for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 🚀 INCREASED from 2000 to 10000 (10 seconds)
  acquireTimeoutMillis: 60000,     // 🚀 NEW: 60 second acquire timeout
  allowExitOnIdle: true,           // 🚀 NEW: Allow pool to exit when idle
});

// 🚀 ENHANCED: Better error handling
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  console.error('🔧 Check your DATABASE_URL in .env.local');
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

// 🚀 ENHANCED: Better connection test with retry logic
export async function testConnection() {
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`🔄 Testing PostgreSQL connection (${4 - retries}/3)...`);
      
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time');
      client.release();
      
      console.log('✅ PostgreSQL connection test successful');
      console.log('🕐 Server time:', result.rows[0].current_time);
      return true;
      
    } catch (error) {
      retries--;
      console.error(`❌ PostgreSQL connection test failed (${retries} retries left):`, error.message);
      
      // Check specific error types
      if (error.code === 'ENOTFOUND') {
        console.error('🔧 DNS lookup failed - check your DATABASE_URL host');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('🔧 Connection refused - check if database is running');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('🔧 Connection timeout - check network/firewall');
      } else if (error.message.includes('password authentication failed')) {
        console.error('🔧 Authentication failed - check username/password');
      }
      
      if (retries === 0) {
        throw error;
      }
      
      // Wait 2 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
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

// Export all other functions (same as original)
export async function getUserAbstracts(userId) {
  const client = await pool.connect();
  try {
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (isNaN(id)) throw new Error('Invalid user ID provided');
    
    console.log(`🔄 Getting abstracts for user ${id}...`);
    await migrateCategoryColumn();
    const hasCategoryColumn = await checkCategoryColumnExists(client);
    
    let query = hasCategoryColumn ? `
      SELECT id, title, presenter_name, institution_name, presentation_type,
             category, abstract_content, co_authors, status, abstract_number,
             registration_id, submission_date, updated_at, reviewer_comments,
             file_path, file_name, file_size
      FROM abstracts WHERE user_id = $1 ORDER BY submission_date DESC
    ` : `
      SELECT id, title, presenter_name, institution_name, presentation_type,
             abstract_content, co_authors, status, abstract_number,
             registration_id, submission_date, updated_at, reviewer_comments,
             file_path, file_name, file_size
      FROM abstracts WHERE user_id = $1 ORDER BY submission_date DESC
    `;
    
    const result = await client.query(query, [id]);
    const abstracts = result.rows.map(abstract => ({
      ...abstract,
      category: abstract.category || 'Hematology',
      categoryType: abstract.category || 'Hematology',
      hasFile: !!(abstract.file_name && abstract.file_path)
    }));
    
    console.log(`📊 Found ${abstracts.length} abstracts for user ${id}`);
    return abstracts;
    
  } catch (error) {
    console.error('❌ Error getting user abstracts:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getAbstractsByUserId(userId) {
  return await getUserAbstracts(userId);
}

export async function getAllAbstracts() {
  const client = await pool.connect();
  try {
    await migrateCategoryColumn();
    const hasCategoryColumn = await checkCategoryColumnExists(client);
    
    let query = hasCategoryColumn ? `
      SELECT a.id, a.title, a.presenter_name, a.institution_name, a.presentation_type,
             a.category, a.abstract_content, a.co_authors, a.status, a.abstract_number,
             a.registration_id, a.submission_date, a.updated_at, a.reviewer_comments,
             a.file_path, a.file_name, a.file_size,
             u.email, u.phone, u.full_name as user_full_name
      FROM abstracts a LEFT JOIN users u ON a.user_id = u.id 
      ORDER BY a.submission_date DESC
    ` : `
      SELECT a.id, a.title, a.presenter_name, a.institution_name, a.presentation_type,
             a.abstract_content, a.co_authors, a.status, a.abstract_number,
             a.registration_id, a.submission_date, a.updated_at, a.reviewer_comments,
             a.file_path, a.file_name, a.file_size,
             u.email, u.phone, u.full_name as user_full_name
      FROM abstracts a LEFT JOIN users u ON a.user_id = u.id 
      ORDER BY a.submission_date DESC
    `;
    
    const result = await client.query(query);
    console.log(`📊 Retrieved ${result.rows.length} total abstracts`);
    
    return result.rows.map((abstract, index) => ({
      id: abstract.id,
      title: abstract.title || 'Untitled',
      presenter_name: abstract.presenter_name || 'Unknown',
      email: abstract.email || 'N/A',
      phone: abstract.phone || 'N/A',
      institution_name: abstract.institution_name || 'N/A',
      status: abstract.status || 'pending',
      presentation_type: abstract.presentation_type || 'Free Paper',
      category: abstract.category || 'Hematology',
      abstract_number: abstract.abstract_number || `ABST-${String(index + 1).padStart(3, '0')}`,
      submission_date: abstract.submission_date,
      updated_at: abstract.updated_at,
      reviewer_comments: abstract.reviewer_comments,
      file_path: abstract.file_path,
      file_name: abstract.file_name,
      file_size: abstract.file_size,
      abstract_content: abstract.abstract_content || '',
      co_authors: abstract.co_authors || 'N/A',
      registration_id: abstract.registration_id || 'N/A',
      hasFile: !!(abstract.file_path || abstract.file_name),
      isLegacyRecord: !abstract.category
    }));
    
  } catch (error) {
    console.error('❌ Error getting all abstracts:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getAbstractById(abstractId) {
  const client = await pool.connect();
  try {
    let id = abstractId;
    if (typeof abstractId === 'string' && /^\d+$/.test(abstractId)) {
      id = parseInt(abstractId, 10);
    }
    
    console.log(`🔍 Looking up abstract with ID: ${id}`);
    
    const query = `
      SELECT a.*, u.email, u.phone, u.full_name as user_full_name
      FROM abstracts a LEFT JOIN users u ON a.user_id = u.id 
      WHERE a.id = $1
    `;
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Abstract ${id} not found in database`);
      return null;
    }
    
    const abstract = result.rows[0];
    if (!abstract.category) abstract.category = 'Hematology';
    
    return {
      ...abstract,
      hasFile: !!(abstract.file_path || abstract.file_name)
    };
    
  } catch (error) {
    console.error('❌ Error getting abstract by ID:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Add other missing functions
export async function updateAbstractStatus(abstractId, status, comments = null) {
  const client = await pool.connect();
  try {
    const id = typeof abstractId === 'string' ? parseInt(abstractId, 10) : abstractId;
    if (isNaN(id)) throw new Error('Invalid abstract ID provided');
    
    const query = `
      UPDATE abstracts 
      SET status = $1, reviewer_comments = $2, updated_at = NOW()
      WHERE id = $3 RETURNING *
    `;
    
    const result = await client.query(query, [status, comments, id]);
    if (result.rows.length === 0) throw new Error(`Abstract with ID ${id} not found`);
    
    console.log('✅ Abstract status updated successfully');
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Error updating abstract status:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getStatistics() {
  const client = await pool.connect();
  try {
    await migrateCategoryColumn();
    const hasCategoryColumn = await checkCategoryColumnExists(client);
    
    const query = hasCategoryColumn ? `
      SELECT presentation_type, category,
             COUNT(*) as total_count,
             COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
             COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
             COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
      FROM abstracts GROUP BY presentation_type, category
      ORDER BY presentation_type, category
    ` : `
      SELECT presentation_type, 'Hematology' as category,
             COUNT(*) as total_count,
             COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
             COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
             COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
      FROM abstracts GROUP BY presentation_type ORDER BY presentation_type
    `;
    
    const result = await client.query(query);
    
    const totalQuery = `
      SELECT COUNT(*) as total_abstracts,
             COUNT(CASE WHEN status = 'pending' THEN 1 END) as total_pending,
             COUNT(CASE WHEN status = 'approved' THEN 1 END) as total_approved,
             COUNT(CASE WHEN status = 'rejected' THEN 1 END) as total_rejected,
             COUNT(CASE WHEN status = 'final_submitted' THEN 1 END) as total_final_submitted,
             COUNT(DISTINCT user_id) as total_users
      FROM abstracts
    `;
    
    const totalResult = await client.query(totalQuery);
    
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

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Checking database tables...');
    
    const tablesQuery = `
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'abstracts')
    `;
    
    const result = await client.query(tablesQuery);
    const existingTables = result.rows.map(row => row.table_name);
    
    if (existingTables.includes('users') && existingTables.includes('abstracts')) {
      console.log('✅ Database tables exist and ready');
      
      try {
        await migrateCategoryColumn();
      } catch (migrationError) {
        console.error('⚠️ Migration warning:', migrationError);
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

// Additional utility functions
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
    `INSERT INTO uploaded_files (abstract_id, file_name, file_path, file_size) VALUES ($1, $2, $3, $4)`,
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

// Export pool for direct access
export { pool };

// Default export
export default {
  createUser,
  getUserByEmail,
  getUserById,
  createAbstract,
  getAbstractsByUserId,
  getUserAbstracts,
  getAllAbstracts,
  getAbstractById,
  updateAbstractStatus,
  getStatistics,
  testConnection,
  initializeDatabase,
  closePool,
  getFilesByAbstractId,
  saveUploadedFile,
  migrateCategoryColumn,
  pool
};