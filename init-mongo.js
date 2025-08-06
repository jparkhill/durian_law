db = db.getSiblingDB('mycase');

// Create default admin user with properly hashed password (admin123)
db.users.insertOne({
  email: 'admin@mycase.local',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  firstName: 'System',
  lastName: 'Administrator',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized with default admin user');
print('Email: admin@mycase.local');
print('Password: admin123');