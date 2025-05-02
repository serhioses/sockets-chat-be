import 'dotenv/config';

import { server } from './lib/server.js';
import { connectDB } from './lib/db.js';;
import { initSocket } from './sockets/index.js';

const port = process.env.PORT || 8000;

initSocket();

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});
