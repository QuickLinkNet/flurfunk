CREATE TABLE children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  household_id INT NOT NULL,
  name VARCHAR(60) NOT NULL,
  birthdate DATE DEFAULT NULL,
  current_location ENUM('mama','papa','both','grandparents','friends','vacation','school','kindergarten','other')
    NOT NULL DEFAULT 'both',
  location_note VARCHAR(120) DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (household_id) REFERENCES households(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  household_id INT NOT NULL,
  name VARCHAR(60) NOT NULL,
  type ENUM('dog','cat','other') NOT NULL DEFAULT 'other',
  FOREIGN KEY (household_id) REFERENCES households(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
