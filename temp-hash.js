const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'TempPassword123!';
  const hash = await bcrypt.hash(password, 12);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

generateHash();
