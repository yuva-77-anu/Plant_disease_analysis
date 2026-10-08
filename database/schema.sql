-- AI Plant Disease Detection Database Schema

CREATE DATABASE IF NOT EXISTS plant_disease_db;
USE plant_disease_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Predictions/History table
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plant_name VARCHAR(100) NOT NULL,
    disease_name VARCHAR(150) NOT NULL,
    confidence FLOAT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    description TEXT,
    treatment TEXT,
    organic_treatment TEXT,
    fertilizer TEXT,
    prevention_tips TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Disease information table
CREATE TABLE IF NOT EXISTS disease_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plant_name VARCHAR(100) NOT NULL,
    disease_name VARCHAR(150) NOT NULL,
    description TEXT,
    treatment TEXT,
    organic_treatment TEXT,
    fertilizer TEXT,
    prevention_tips TEXT,
    symptoms TEXT
);

-- Indexes for better performance
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_date ON predictions(created_at);
CREATE INDEX idx_disease_info_plant ON disease_info(plant_name);
CREATE INDEX idx_disease_info_lookup ON disease_info(plant_name, disease_name);
