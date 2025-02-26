//IMPORTS  ---> todas las dependecias que vayamos a utilizar
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

//CREAR EL SERVIDOR Y CONFIGURARLO
const server = express();  
require("dotenv").con
server.use(express.json({limit: "50mb"}));

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
    console.log(connection);
    return connection;   
};

getDBconnection();

//ENDPOINTS

//rutas endpoint --> API
//GET, POST, PUT, DELETE