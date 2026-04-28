import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Start server
app.listen(PORT, () => {
    console.log(`OnShape BOM Checker running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to use the application.`);
    console.log(`All logic now runs client-side using bom-utils.js`);
});

