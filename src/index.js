import 'dotenv/config';

import { server } from './lib/server.js';
import { connectDB } from './lib/db.js';
import './lib/io.js';

const port = process.env.PORT || 8000;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});
