require('dotenv').config();
const bcrypt = require('bcryptjs');

// Koneksi langsung tanpa Sequelize untuk menghindari konflik model
const mysql = require('mysql2/promise');

async function resetPasswords() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'clinic_db',
  });

  console.log('✅ Terhubung ke database');

  // Cek user yang ada
  const [users] = await conn.execute(
    'SELECT id, username, role, LEFT(password, 10) as pass_preview FROM users'
  );
  console.log('\n📋 Data user saat ini:');
  console.table(users);

  // Generate hash baru
  const hash = await bcrypt.hash('password', 10);
  console.log('\n🔑 Hash baru:', hash);

  // Update semua user
  const [result] = await conn.execute(
    'UPDATE users SET password = ?',
    [hash]
  );
  console.log(`\n✅ ${result.affectedRows} user berhasil diupdate`);

  // Verifikasi
  const [after] = await conn.execute(
    'SELECT id, username, role FROM users'
  );
  console.log('\n📋 User setelah update:');
  console.table(after);

  // Test bcrypt verify untuk admin
  const [adminRow] = await conn.execute(
    "SELECT password FROM users WHERE username = 'admin'"
  );
  if (adminRow.length > 0) {
    const isValid = await bcrypt.compare('password', adminRow[0].password);
    console.log('\n🧪 Test verifikasi password admin:', isValid ? '✅ BERHASIL' : '❌ GAGAL');
  }

  await conn.end();
  console.log('\n🎉 Selesai! Login dengan password: password');
}

resetPasswords().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
