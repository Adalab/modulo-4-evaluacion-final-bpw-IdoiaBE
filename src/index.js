//IMPORTS  ---> todas las dependecias que vayamos a utilizar
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

//CREAR EL SERVIDOR Y CONFIGURARLO
const server = express();  //esto es un servidor de tipo express al que he llamado server
require("dotenv").config();    //para poder trabajar con las variables de entorno
server.use(cors());  //habilitarlo para que se puedan hacer peticiones desde cualquier lado (html, react...)
server.use(express.json({limit: "50mb"}));

//CONFIGURACIÓN DEL PUERTO
const PORT = 5001;  //entre 3000 y 7000
server.listen(PORT, ()=>{  
    console.log (`Servidor corriendo por http://localhost:${PORT}`)
});   
//la función listen tiene 2 parámetros: puerto por el que quiero escuchar, qué quiero hacer cuando me haya conectado a ese puerto

//CONECTARSE A LA BD
async function getDBconnection() {
    const connection = await mysql.createConnection({  
        host: process.env.HOST_DB,  //el lugar donde se guarde la bd (ej:freeDB)
        user: process.env.USER_DB, 
        password: process.env.PASS_DB ,
        database: process.env.DATABASE,
    });
    await connection.connect();
    // console.log(connection);
    return connection;   
};

// getDBconnection();

//ENDPOINTS

//rutas endpoint --> API
//GET, POST, PUT, DELETE