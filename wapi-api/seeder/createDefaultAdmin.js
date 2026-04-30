import bcrypt from 'bcryptjs';
import { User, Role } from '../models/index.js';


/**
 * Create default admin user
 * @param {Object} adminData - Admin user data
 */
async function createDefaultAdmin(adminData) {
  try {
    const adminEmail = adminData?.email || process.env.ADMIN_EMAIL;
    const adminPassword = adminData?.password || process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = adminData?.name || process.env.ADMIN_NAME || 'Admin';

    if (!adminEmail) {
      console.error('❌ Invalid admin data provided');
      return { success: false, error: 'Invalid admin data' };
    }

    const existingAdmin = await User.findOne({ email: adminEmail, deleted_at: null });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const superAdminRole = await Role.findOne({ name: 'super_admin' });

      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role_id: superAdminRole ? superAdminRole._id : null,
        email_verified: true
      });

      console.log('✅ Default admin user created successfully');
      console.log(`   Email: ${adminEmail}`);
      return { success: true, user: admin };
    } else {
      console.log('ℹ️  Admin user already exists, skipping');
      return { success: true, user: existingAdmin };
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    return { success: false, error: error.message };
  }
}


export default createDefaultAdmin;
