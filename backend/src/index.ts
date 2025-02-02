import { Hono } from 'hono'
import {decode, sign, verify} from 'hono/jwt'
import { cors } from 'hono/cors';
const app = new Hono<{
    Bindings:{
      DATABASE_URL: string,
      SECRET: string
    }
}>(); //bindings make the database_url type error go away in typescript
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
app.use('/*', cors());
app.route('api/v1/user', userRouter);
app.route('api/v1/blog', blogRouter);

export default app
