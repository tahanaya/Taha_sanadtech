import express from 'express';
import cors from 'cors';
import { usersRouter } from './routes/users';
import { alphabetRouter } from './routes/alphabet';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', usersRouter);
app.use('/alphabet', alphabetRouter);

export default app;
