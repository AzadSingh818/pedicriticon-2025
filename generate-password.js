// generate-password.js
// Ye file banao project ke main folder mein

const bcrypt = require('bcryptjs');

async function createAdminPassword() {
  // 👇 Yahan apna password likho
  const myPassword = 'admin123';  // Change karo apna password
  
  console.log('🔄 Password hash bana rahe hain...');
  
  try {
    // Password ko hash karte hain
    const hashedPassword = await bcrypt.hash(myPassword, 12);
    
    console.log('\n✅ SUCCESS! Hash ban gaya:');
    console.log('==========================================');
    console.log('Aapka Password:', myPassword);
    console.log('Generated Hash:', hashedPassword);
    console.log('==========================================');
    console.log('\n📝 Ye hash copy karo aur .env.local file mein paste karo');
    console.log(`ADMIN_PASSWORD_HASH=${hashedPassword}`);
    
  } catch (error) {
    console.log('❌ Error:', error);
  }
}

// Function run karo
createAdminPassword();