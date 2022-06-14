var net = require('net');
var myCon = require('./console');
var config = require('./config.json');
var obj = require("./comandos.json");
var listaComandos = obj.comands;
const options = {
    host: config.ip,
    port : config.port
}
var client = net.connect(options);
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.on('connect', () => {
    myCon.log("Conected!");
});

client.on('data', msg => {
    myCon.log(msg.toString());
});

client.on('end', () => {
    myCon.log("sair");
    process.exit;
});

client.on('error', e => {
    myCon.log(e.toString());
});

rl.on('line',input => {
    showArrEl(input.toString().trim());
});

function showArrEl (key){
    client.write(`${key}`);
}