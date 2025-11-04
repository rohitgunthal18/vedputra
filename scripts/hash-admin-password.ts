/**
 * One-time script to hash admin password
 * Run: npx tsx scripts/hash-admin-password.ts
 */

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaqzyfiiapihjiexplqs.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function hashAdminPassword() {
  try {
    const adminPassword = '4482@AdmiN';
    
    // Generate bcrypt hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    console.log('Hashing admin password...');
    console.log('Hash:', hashedPassword);
    
    // Update admin user
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .update({ password_hash: hashedPassword })
      .eq('email', 'admin@vedputra.in')
      .select();
    
    if (error) {
      console.error('Error updating password:', error);
      process.exit(1);
    }
    
    console.log('✅ Admin password hashed successfully!');
    console.log('Updated admin:', data);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

hashAdminPassword();

