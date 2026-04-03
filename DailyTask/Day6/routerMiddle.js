import express from 'express';
import router from './routes/user.js';

const app = express();

app.use(express.json());

app.use('/user', router);

app.listen(3001, () => console.log('server is running on port 3001'));
