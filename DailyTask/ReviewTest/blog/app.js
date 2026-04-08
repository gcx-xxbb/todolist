import express from 'express';
import userRouter from './routes/user';

const app = express();
app.use(express.json());

app.use('/user', userRouter);

app.listen(3000, () => {
  return `server is running on port 3000`;
});
