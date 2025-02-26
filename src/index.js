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

// const [rows] = await connection.execute("SELECT * FROM characters");

// const convertedData = rows.map(row => ({
//   ...row,
//   alive: !!row.alive // Convierte 1 a true y 0 a false
// }));

// console.log(convertedData);

//ENDPOINTS

//Obtener lista de personajes ordenados alfabeticamente
//GET
server.get("/characters", async (req, res)=>{
    try {

        const con = await getDBconnection();

        const sqlSelect = "SELECT characters.name, GROUP_CONCAT(DISTINCT AKA.alt_name ORDER BY AKA.alt_name ASC SEPARATOR ', ') AS alt_names, characters.gender, characters.category, characters.alive, characters.religion, characters.social_group, characters.image, GROUP_CONCAT(DISTINCT seasons.season ORDER BY seasons.season ASC) AS seasons_list FROM characters LEFT JOIN AKA ON characters.idcharacters = AKA.fk_character LEFT JOIN characters_seasons ON characters.idcharacters = characters_seasons.fk_characters LEFT JOIN seasons ON characters_seasons.fk_seasons = seasons.idseason GROUP BY characters.idcharacters ORDER BY characters.name ASC";

        const [result] = await con.query(sqlSelect);

        con.end();

        if (result.length === 0) {
            res.status(404).json({
              status: 'error',
              message: 'No se encontró ningún personaje',
            });
          } else {
            res.status(200).json({
              status: 'success',
              data: result,
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

        con.end();

        if (result.length === 0) {
            res.status(404).json({
              status: 'error',
              message: 'No se encontró ningún personaje',
            });
          } else {
            res.status(200).json({
              status: 'success',
              data: result[0],
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
// {
//     "name": "Piper Chapman",
//     "alt_names": "Blanca, Blondie, College , Dandelion, Jefa, La Llorona, Pipes, Taylor Swift",
//     "gender": "Cis woman",
//     "category": "Inmate",
//     "alive": 1,
//     "religion": "Atheist",
//     "social_group": "White",
//     "image": "https://ucarecdn.com/f79a0a54-d2dc-4b03-93f7-082b14a95b4b/-/crop/517x517/38,0/-/preview/-/progressive/yes/-/format/auto/-/scale_crop/900x900/",
//     "seasons_list": "1,2,3,4,5,6,7"
// }
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

        console.log(result);

        //recoger el id que se ha creado
        const newId = result.insertId;
        



        
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
        const deleteSeason = "DELETE FROM characters_seasons WHERE fk_characters = ?";

        const sqlDelete = `${deleteCharacter}${deleteAKA}${deleteSeason}`

        const [result] = await con.query(sqlDelete, [id]);

        con.end();

        if (result.affectedRows > 0) {
            res.status(200).json({ 
                status: 'success' 
            });
          } else {
            res
              .status(400).json({ 
                status: 'error', 
                message: 'ha ocurrido un error al eliminar' 
            });
          }
        
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error,
          });
    }
});