const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./cms.db');

async function createAdmin() {
  const username = 'admin';
  const password = 'admin123'; // Change this!
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run(
    'INSERT OR REPLACE INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, 'admin'],
    function(err) {
      if (err) {
        console.error('Error creating admin user:', err);
      } else {
        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Please change the password after first login!');
      }
      db.close();
    }
  );
}

createAdmin();
