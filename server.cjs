const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');

const routes = [
    '/',
    '/cases',
    '/manufacturing',
    '/catalog',
    '/catalog/rotary-crusher',
    '/catalog/isolators',
    '/catalog/drying-cabinets',
    '/en',
    '/en/cases',
    '/en/manufacturing',
    '/en/catalog',
    '/en/catalog/rotary-crusher',
    '/en/catalog/isolators',
    '/en/catalog/drying-cabinets',
];

// Массив расширений файлов, которые нужно вернуть напрямую
const fileExtensions = [
    '.otf', '.ico', '.svg', '.html', '.ttf', '.mp4',
    '.webm', '.webp', '.mov', '.css', '.js', '.png'
];

// Функция для установки корректного Content-Type
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.otf': 'font/opentype',
    '.ttf': 'font/ttf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.webp': 'image/webp',
    '.mov': 'video/quicktime',
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Функция для отправки файла с корректным Content-Type
    function sendFile(filePath, statusCode = 200) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(`Ошибка чтения файла ${filePath}:`, err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(statusCode, { 'Content-Type': contentType });
            res.end(data);
        });
    }

    // Проверяем, является ли запрошенный путь одним из маршрутов для index.html
    if (routes.includes(pathname)) {
        const indexPath = path.join(distDir, 'index.html');
        console.log(`Отдаем index.html на путь ${pathname}`);
        sendFile(indexPath);
        return;
    }

    // Проверяем, запрашивается ли файл с разрешенным расширением
    const ext = path.extname(pathname).toLowerCase();
    if (fileExtensions.includes(ext)) {
        const filePath = path.join(distDir, pathname);

        // Проверяем, что файл существует
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.warn(`Файл не найден: ${filePath}, отдаём 404`);
                const notFoundPath = path.join(distDir, '404.html');
                sendFile(notFoundPath, 404);
            } else {
                console.log(`Отдаем файл: ${filePath}`);
                sendFile(filePath);
            }
        });
        return;
    }

    // Во всех остальных случаях отдаём 404.html
    console.log(`Путь не найден: ${pathname}, отдаём 404.html`);
    const notFoundPath = path.join(distDir, '404.html');
    sendFile(notFoundPath, 404);
});

server.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
