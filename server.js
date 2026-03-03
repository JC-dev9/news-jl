const http = require('http'); // Módulo do Node para criar servidor web
const fs = require('fs');     // Módulo do Node para ler ficheiros do sistema
const path = require('path'); // Módulo do Node para manipulação de caminhos de ficheiros

const PORT = 8000; // Porta onde o servidor vai correr localmente

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
}; // Mapeamento de extensões para definir o Content-Type correto no browser

http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html'; // Ficheiro devolvido por defeito na raiz
    }

    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Lê o ficheiro e devolve a resposta ao cliente
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content || '404 PÃ¡gina nÃ£o encontrada', 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Erro no servidor: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}).listen(PORT);

console.log(`Servidor rodando em http://localhost:${PORT}`);
console.log('Pressione Ctrl+C para parar.');
