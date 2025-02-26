use oitnb;
SELECT * FROM characters;
SELECT * FROM AKA;
SELECT * FROM seasons;
SELECT * FROM characters_seasons;

SELECT idcharacters FROM characters;

INSERT INTO seasons (season)
VALUES (1), (2), (3), (4), (5), (6), (7);

INSERT INTO characters_seasons (fk_characters, fk_seasons)
VALUES (1,1), (1,2), (1,3), (1,4), (1,5), (1,6), (1,7);
INSERT INTO characters_seasons (fk_characters, fk_seasons)
VALUES (2,1), (2,2), (2,3), (2,4), (2,5), (2,6), (2,7);

-- seleccionar todos los personajes con sus AKA y seasons y ordenarlos alfabeticamente
SELECT 
    characters.name, 
    GROUP_CONCAT(DISTINCT AKA.alt_name ORDER BY AKA.alt_name ASC SEPARATOR ', ') AS alt_names, 
    characters.gender, 
    characters.category, 
    characters.alive, 
    characters.religion, 
    characters.social_group, 
    characters.image, 
    GROUP_CONCAT(DISTINCT seasons.season ORDER BY seasons.season ASC) AS seasons_list
FROM characters 
LEFT JOIN AKA ON characters.idcharacters = AKA.fk_character
LEFT JOIN characters_seasons ON characters.idcharacters = characters_seasons.fk_characters
LEFT JOIN seasons ON characters_seasons.fk_seasons = seasons.idseason
GROUP BY characters.idcharacters
ORDER BY characters.name ASC;

-- seleccionar un personaje con sus datos asociados por su id
SELECT 
    characters.name, 
    GROUP_CONCAT(DISTINCT AKA.alt_name ORDER BY AKA.alt_name ASC SEPARATOR ', ') AS alt_names, 
    characters.gender, 
    characters.category, 
    characters.alive, 
    characters.religion, 
    characters.social_group, 
    characters.image, 
    GROUP_CONCAT(DISTINCT seasons.season ORDER BY seasons.season ASC) AS seasons_list
FROM characters 
LEFT JOIN AKA ON characters.idcharacters = AKA.fk_character
LEFT JOIN characters_seasons ON characters.idcharacters = characters_seasons.fk_characters
LEFT JOIN seasons ON characters_seasons.fk_seasons = seasons.idseason
WHERE idcharacters = 2;

-- añadir un nuevo personaje 

INSERT INTO characters (name, gender, category, alive, religion, social_group, image)
VALUES ("Tasha Jefferson", "Cis Woman", "Inmate", 1, "Christian", "Black", "https://static.wikia.nocookie.net/orange-is-the-new-black/images/0/07/TaysteePromo2.png/revision/latest/smart/width/300/height/300?cb=20140625011036");

INSERT INTO AKA (alt_name, fk_character)
VALUES ("Taystee", 3), ("Amanda", 3), ("T", 3);

INSERT INTO characters_seasons (fk_characters, fk_seasons)
VALUES (3,1), (3,2), (3,3), (3,4), (3,5), (3,6), (3,7);

-- eliminar un personaje

DELETE FROM characters 
WHERE idcharacters = 5;

DELETE FROM AKA 
WHERE fk_character = 4;

DELETE FROM characters_seasons 
WHERE fk_characters = 4;
