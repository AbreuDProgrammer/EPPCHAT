var net = require('net');
var myCon = require('./anexo/console');
var config = require('./anexo/config');
const options = {
    host: config.IP,
    port : config.PORT
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
    process.exit();
});

client.on('error', e => {
    myCon.log(e.toString());
});

rl.on('line',input => {
    if(input.toString() == "/exit"){
        client.end();
    } else
    showArrEl(input.toString().trim());
});

function showArrEl (key){
    client.write(`${key}`);
}