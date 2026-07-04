CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  household_id INT DEFAULT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(80) NOT NULL,
  role ENUM('admin','member','guest') NOT NULL DEFAULT 'member',
  avatar_url VARCHAR(255) DEFAULT NULL,
  notification_prefs JSON DEFAULT NULL,
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (household_id) REFERENCES households(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
