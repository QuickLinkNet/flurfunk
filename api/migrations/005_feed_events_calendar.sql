CREATE TABLE feed_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  household_id INT NOT NULL,
  type ENUM('vacation','home','visit_expected','garden_party','bbq','spontaneous_meetup',
    'street_closed','package_received','tool_available','help_needed','babysitter_needed',
    'dog_lost','cat_found','trash_reminder','street_event','other') NOT NULL,
  message VARCHAR(280) DEFAULT NULL,
  visibility ENUM('public','neighbors','private') NOT NULL DEFAULT 'neighbors',
  expires_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (household_id) REFERENCES households(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_household_id INT NOT NULL,
  title VARCHAR(120) NOT NULL,
  type ENUM('bbq','campfire','street_festival','kids_play','football','pool_party',
    'mulled_wine','christmas_party','other') NOT NULL,
  description TEXT DEFAULT NULL,
  location VARCHAR(160) DEFAULT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME DEFAULT NULL,
  visibility ENUM('public','neighbors') NOT NULL DEFAULT 'neighbors',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_household_id) REFERENCES households(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE event_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  household_id INT NOT NULL,
  response ENUM('yes','maybe','no') NOT NULL,
  adults_count TINYINT DEFAULT NULL,
  children_count TINYINT DEFAULT NULL,
  note VARCHAR(120) DEFAULT NULL,
  responded_by_user_id INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_event_household (event_id, household_id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (household_id) REFERENCES households(id),
  FOREIGN KEY (responded_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE calendar_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('vacation','birthday','event','visit','street_action','holiday','trash','appointment') NOT NULL,
  source_table VARCHAR(30) DEFAULT NULL,
  source_id INT DEFAULT NULL,
  household_id INT DEFAULT NULL,
  title VARCHAR(120) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME DEFAULT NULL,
  all_day TINYINT(1) NOT NULL DEFAULT 0,
  visibility ENUM('public','neighbors','private') NOT NULL DEFAULT 'neighbors',
  FOREIGN KEY (household_id) REFERENCES households(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE household_visibility_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  household_id INT NOT NULL,
  field_key VARCHAR(40) NOT NULL,
  visibility ENUM('public','neighbors','private') NOT NULL DEFAULT 'neighbors',
  UNIQUE KEY uniq_household_field (household_id, field_key),
  FOREIGN KEY (household_id) REFERENCES households(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(40) NOT NULL,
  payload JSON DEFAULT NULL,
  read_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
