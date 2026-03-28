CREATE DATABASE IF NOT EXISTS playvix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE playvix;

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pitches (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  location        VARCHAR(255) NOT NULL,
  price_per_hour  DECIMAL(10,2) NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS slots (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pitch_id    INT UNSIGNED NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  CONSTRAINT fk_slots_pitch FOREIGN KEY (pitch_id) REFERENCES pitches(id) ON DELETE CASCADE,
  UNIQUE KEY uq_slot_pitch_time (pitch_id, start_time),
  INDEX idx_slots_pitch (pitch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookings (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  pitch_id      INT UNSIGNED NOT NULL,
  slot_id       INT UNSIGNED NOT NULL,
  booking_date  DATE NOT NULL,
  status        ENUM('pending', 'confirmed', 'cancelled', 'expired') NOT NULL DEFAULT 'pending',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_bookings_pitch FOREIGN KEY (pitch_id) REFERENCES pitches(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_slot  FOREIGN KEY (slot_id)  REFERENCES slots(id)  ON DELETE CASCADE,
  UNIQUE KEY uq_booking_pitch_slot_date (pitch_id, slot_id, booking_date),
  INDEX idx_bookings_user   (user_id),
  INDEX idx_bookings_date   (booking_date),
  INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
