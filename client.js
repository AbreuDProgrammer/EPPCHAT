// Require de todas as bibliotecas utilizadas
var net = require('net');
var myCon = require('./anexo/console');
const CONFIG = require('./anexo/config');

// Configurações da conecção
const options = {
    host: CONFIG.IP,
    port : CONFIG.PORT
}

// Criação do user
var client = net.connect(options);
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Quando a conecção é estabelecida
client.on('connect', () => {
    myCon.log('Conected!');
    timer();
});

// Toda mensagem recebida
client.on('data', msg => {
    myCon.log(msg.toString());
});

// Quando a sessão é encerrada
client.on('end', () => {
    myCon.log('Left');
    process.exit();
});

// Mensagens de erros
client.on('error', e => {
    myCon.log(e.toString());
});

// envia as mensagens, se for /exit encerra a sessão
rl.on('line', input => {
    if(input.toString() == "/exit")
        client.end();
    else
        showArrEl(input.toString().trim());
});

// Envia a mensagem ao server
function showArrEl (key){
    client.write(`${key}`);
    resetTimer();
}

// Variavel para escolher o intervalo
let interval;

// Timer para sair
function timer(){
    interval = setTimeout(function(){
        client.end();
    }, 1000 * CONFIG.TIMEOUT);
}

// Para resetar o timer
function resetTimer(){
    clearTimeout(interval);
    timer();
}