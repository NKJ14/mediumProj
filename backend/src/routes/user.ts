import { Hono } from 'hono'
import {decode, sign, verify} from 'hono/jwt'
export const userRouter = new Hono<{
    Bindings:{
      DATABASE_URL: string,
      SECRET: string
    }
}>(); //bindings make the database_url type error go away in typescript
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

userRouter.post('/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
	const body = await c.req.json();
	try {
		const user = await prisma.user.create({
			data: {
				username: body.username,
				password: body.password,
                name: body.name
			}
		});
    const jwt = await sign({
      id:user.id
    },c.env.SECRET)
		return c.text(jwt);
	} catch(e) {
        console.log(e); //to remove in future
		c.status(403);
    return c.text("invalid.")
	}
})
userRouter.post('/signin', async(c) => {
  const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
	const body = await c.req.json();
	try {
		const user = await prisma.user.findFirst({
			where: { 
				username: body.username,
				password: body.password,
			}
		});
    if(!user){
      return c.status(403);
    }
    const jwt = await sign({
      id:user.id
    },c.env.SECRET)
		return c.text(jwt);
	} catch(e) {
		c.status(403);
    return c.text("invalid.")
	}
})