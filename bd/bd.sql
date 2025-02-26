CREATE DATABASE IF NOT EXISTS oitnb;
use oitnb;

CREATE TABLE characters (
  idcharacters INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(45) NOT NULL,
  gender VARCHAR(45) NULL,
  category VARCHAR(45) NULL,
  alive TINYINT(1) NOT NULL DEFAULT 1,
  religion VARCHAR(45) NULL,
  social_group VARCHAR(45) NOT NULL,
  image TEXT NULL
);


CREATE TABLE AKA (
  idAKA INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  alt_name VARCHAR(50) NULL,
  fk_character INT NOT NULL,
	FOREIGN KEY (fk_character) REFERENCES characters(idcharacters)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE seasons (
  idseason INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  season INT NOT NULL
);


CREATE TABLE characters_seasons (
  fk_characters INT NOT NULL,
  fk_seasons INT NOT NULL,
  id_characters_seasons INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    FOREIGN KEY (fk_characters) REFERENCES characters(idcharacters)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
    FOREIGN KEY (fk_seasons) REFERENCES seasons(idseason)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    );