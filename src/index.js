//IMPORTS  ---> todas las dependecias que vayamos a utilizar
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

//CREAR EL SERVIDOR Y CONFIGURARLO
const server = express(); 
server.use(cors());
server.use(express.json({limit: "50mb"}));
require("dotenv").config();


//CONFIGURACIÓN DEL PUERTO
const PORT = 5001;  //entre 3000 y 7000
server.listen(PORT, ()=>{  
    console.log (`Servidor corriendo por http://localhost:${PORT}`)
});   

//CONECTARSE A LA BD
async function getDBconnection() {
    const connection = await mysql.createConnection({  
        host: process.env.HOST_DB, 
        user: process.env.USER_DB, 
        password: process.env.PASS_DB ,
        database: process.env.DATABASE,
    });
    await connection.connect();

    return connection;   
};

//ENDPOINTS

//Obtener lista de personajes ordenados alfabeticamente
//GET
server.get("/characters", async (req, res)=>{
    try {

        const con = await getDBconnection();

        const sqlSelect = "SELECT characters.name, GROUP_CONCAT(DISTINCT AKA.alt_name ORDER BY AKA.alt_name ASC SEPARATOR ', ') AS alt_names, characters.gender, characters.category, characters.alive, characters.religion, characters.social_group, characters.image, GROUP_CONCAT(DISTINCT seasons.season ORDER BY seasons.season ASC) AS seasons_list FROM characters LEFT JOIN AKA ON characters.idcharacters = AKA.fk_character LEFT JOIN characters_seasons ON characters.idcharacters = characters_seasons.fk_characters LEFT JOIN seasons ON characters_seasons.fk_seasons = seasons.idseason GROUP BY characters.idcharacters ORDER BY characters.name ASC";

        const [result] = await con.query(sqlSelect);

        const transformedResult = result.map(character => ({
            ...character,
            alive: character.alive === 1
        }));


        con.end();


        if (transformedResult.length === 0) {
            res.status(404).json({
              status: 'error',
              message: 'No se encontró ningún personaje',
            });
          } else {
            res.status(200).json({
              status: 'success',
              data: transformedResult,
            });
          }
        
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error,
          });
    }
});

//Obtener un personaje por su ID
//GET, URL params
server.get("/characters/:id", async (req, res)=>{
    try {

        const { id } = req.params;

        const con = await getDBconnection();

        const selectById = "SELECT characters.name, GROUP_CONCAT(DISTINCT AKA.alt_name ORDER BY AKA.alt_name ASC SEPARATOR ', ') AS alt_names, characters.gender, characters.category, characters.alive, characters.religion, characters.social_group, characters.image, GROUP_CONCAT(DISTINCT seasons.season ORDER BY seasons.season ASC) AS seasons_list FROM characters LEFT JOIN AKA ON characters.idcharacters = AKA.fk_character LEFT JOIN characters_seasons ON characters.idcharacters = characters_seasons.fk_characters LEFT JOIN seasons ON characters_seasons.fk_seasons = seasons.idseason WHERE idcharacters = ? GROUP BY characters.idcharacters";

        const [result] = await con.query(selectById, [id]);

        const transformedResult = result.map(character => ({
            ...character,
            alive: character.alive === 1
        }));

        con.end();

        if (transformedResult.length === 0) {
            res.status(404).json({
              status: 'error',
              message: 'No se encontró ningún personaje',
            });
          } else {
            res.status(200).json({
              status: 'success',
              data: transformedResult[0],
            });
          }
        
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error,
          });
    }
});


//Añadir nuevo personaje
//POST, body params
server.post("/characters", async (req, res)=>{
    try {
        const {name, alt_names, gender,category, alive, religion, social_group, image, seasons_list} = req.body;
        
        //validar campos obligatorios
        if (!name || !alive || !social_group || !seasons_list) {
            return res.status(400).json({
                status: 'error',
                message: 'Los campos de name, alive, social_group y seasons_list deben estar rellenos',
            });
        };

        const con = await getDBconnection();

        //comprobar que ese personaje no existe en la bd
        const checkCharacter = "SELECT idcharacters FROM characters WHERE name = ?";
        const [existingCharacter] = await con.query(checkCharacter, [name]);

        if (existingCharacter.length > 0) {
            con.end();
            return res.status(409).json({ 
                status: 'error',
                message: 'El personaje ya existe en la base de datos',
            });
        }

        const sqlInsert = "INSERT INTO characters (name, gender, category, alive, religion, social_group, image) VALUES (?, ?, ?, ?, ?, ?, ?)";

        const [result] = await con.query(sqlInsert, [
            name,
            gender,
            category,
            alive,
            religion,
            social_group,
            image,
        ]);

        //recoger el id que se ha creado
        const newId = result.insertId;

       //si hay nombre alternativos, los añado a la tabla AKA
        if (Array.isArray(alt_names) && alt_names.length > 0){
            const sqlInsertAKA = `INSERT INTO AKA (alt_name, fk_character) VALUES (?, ?)`;

            for (const eachAltName of alt_names) {
                await con.query(sqlInsertAKA, [eachAltName, newId]);
            }
        };

        const sqlInsertSeasons = "INSERT INTO characters_seasons (fk_characters, fk_seasons) VALUES (?,?)"
        //añado cada temporada asociada al personaje
        for (const eachSeason of seasons_list) {
            await con.query(sqlInsertSeasons, [newId,eachSeason]);
        };

        //consulta para comprobar si se han añadido todos los datos del personaje
        const sqlCharacter = "SELECT characters.name,GROUP_CONCAT(DISTINCT AKA.alt_name ORDER BY AKA.alt_name ASC SEPARATOR ', ') AS alt_names, characters.gender, characters.category, characters.alive, characters.religion, characters.social_group, characters.image, GROUP_CONCAT(DISTINCT seasons.season ORDER BY seasons.season ASC) AS seasons_list FROM characters LEFT JOIN AKA ON characters.idcharacters = AKA.fk_character LEFT JOIN characters_seasons ON characters.idcharacters = characters_seasons.fk_characters LEFT JOIN seasons ON characters_seasons.fk_seasons = seasons.idseason WHERE idcharacters = ? GROUP BY characters.idcharacters";

        const [resultCharacter] = await con.query(sqlCharacter, [newId]);

        if (resultCharacter) {
            res.status(201).json({
                status: "success",
                message: resultCharacter[0],
            });
          } else {
            res.status(400).json({
                status: 'error',
                message: 'No se insertó',
            });
          }
        

        
    } catch (error) {
         res.status(500).json({
            status: 'error',
            message: error,
          });
    };
});


//Eliminar un personaje
//DELETE, URL params
server.delete("/characters/:id", async (req, res)=>{
    try {

        const { id } = req.params;

        const con = await getDBconnection();

        const deleteCharacter = "DELETE FROM characters WHERE idcharacters = ?";
        
        const deleteAKA = "DELETE FROM AKA WHERE fk_character = ?";
        const deleteSeasons = "DELETE FROM characters_seasons WHERE fk_characters = ?";

        //Ejecutar las consultas en paralelo
        const [resultAKA, resultSeasons, resultCharacter] = await Promise.all([
            con.query(deleteAKA, [id]),
            con.query(deleteSeasons, [id]),
            con.query(deleteCharacter, [id])
        ]);

        con.end();

        const akaDeleted = resultAKA[0].affectedRows > 0;
        const seasonsDeleted = resultSeasons[0].affectedRows > 0;
        const characterDeleted = resultCharacter[0].affectedRows > 0;

        if (akaDeleted || seasonsDeleted || characterDeleted){
            res.status(200).json({ 
                status: 'success',
                message: "Eliminado correctamente" 
            });
        } else {
            res
              .status(400).json({ 
                status: 'error', 
                message: 'Ha ocurrido un error al eliminar' 
            });
        };
        
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error,
          });
    }
});