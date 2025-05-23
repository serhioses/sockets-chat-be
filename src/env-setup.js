import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const envFile = {
  development: '.env',
  test: '.env.test',
}[process.env.NODE_ENV] || '.env';

dotenv.config({
  path: path.resolve(__dirname, '..', envFile)
});
