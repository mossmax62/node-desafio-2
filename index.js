import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { nanoid } from "nanoid";
import path from "path";


const app = express();
app.use(bodyParser.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getRepertorio =  () => {
    const fsResponse =  fs.readFileSync("repertorio.json", "utf-8");
    const repertorio = JSON.parse(fsResponse);
    console.log(repertorio);
    return repertorio;
    };

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get("/canciones",(req,res) => {
    const repertorio = getRepertorio();
    res.json(repertorio);
});

app.get("/canciones/:id", (req, res) => {
    const id = req.params.id;
    const repertorio = getRepertorio();
    const cancion = repertorio.find((cancion) => cancion.id === id);
    if (!cancion) {
        res.status(404).json({ message: "Cancion no encontrada" });
    }
    res.json(cancion);
});

app.post("/canciones", (req, res) => {
    try {
        const { titulo, artista, tono } = req.body;
        if (titulo == '' || artista== '' || tono == '') {
            throw new Error("Datos incompletos");
        }
        console.log(req.body);
        const newCancion = {
            id: nanoid(),
            titulo,
            artista,
            tono,
        };
        let repertorio = getRepertorio();
        repertorio.push(newCancion);
        fs.writeFileSync("repertorio.json", JSON.stringify(repertorio));
        res.status(201).json(newCancion);
    }catch (error) {
        console.log(error.message);
        res.status(400).json({ message: "Error en los datos ingresados" });
    }
});

app.put("/canciones/:id", (req, res) => {
    const id = req.params.id;
    let repertorio = getRepertorio();
    const cancion = repertorio.find((cancion) => cancion.id === id);
    if (!cancion) {
        res.status(404).json({ message: "Cancion no encontrada" });
    }
    repertorio = repertorio.map((cancion) => {
        if (cancion.id === id) {
            return { ...cancion, ...req.body };
        }
        return cancion;
    });
    fs.writeFileSync("repertorio.json", JSON.stringify(repertorio));
    res.json(cancion);
});

app.delete("/canciones/:id", (req, res) => {
    const id = req.params.id;
    let repertorio = getRepertorio();
    const cancion = repertorio.find((cancion) => cancion.id === id);
    if (!cancion) {
        res.status(404).json({ message: "Cancion no encontrada" });
    }
    repertorio = repertorio.filter((cancion) => cancion.id !== id);
    fs.writeFileSync("repertorio.json", JSON.stringify(repertorio));
    res.json(cancion);
});

app.get("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
    getRepertorio();
});