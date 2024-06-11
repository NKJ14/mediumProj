import { Hono } from 'hono'
import {decode, sign, verify} from 'hono/jwt'
export const blogRouter = new Hono<{
    Bindings:{
      DATABASE_URL: string,
      SECRET: string
    }, 
    Variables:{
        userId:string
    }
}>(); //bindings make the database_url type error go away in typescript
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

blogRouter.use('/*', async (c, next) => {
    const authHeader= c.req.header("authorization") || "";
    const user= await verify(authHeader, c.env.SECRET);
    if(user){
        if (typeof user.id === 'string') {
            c.set('userId',user.id);
          } //typecheck, ignore this, mostly to satisfy typescript
        await next();
    } else{
        c.status(403);
        return c.json({
            msg:"you aren't logged in"
        })
    }
  })
  blogRouter.post('/post', async (c) => {
    const body = await c.req.json();
    const authorId = c.get('userId');
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
    const blog = await prisma.blog.create({
        data: {
            title:body.title,
            content:body.content,
            authorId: authorId
        }
    })
    return c.json({
        id:blog.id
    })
  })
  
  blogRouter.put('/put', async(c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
    const blog = await prisma.blog.update({
        where:{
            id:body.id
        },
        data: {
            title:body.title,
            content:body.content,
            authorId: "dafdasfd"
        }
    })
    return c.json({
        id:blog.id
    })
  })
  
  blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id")
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
    try{
        const blog = await prisma.blog.findFirst({
            where: {
                id: id
            }
        })
        return c.json({
            blog
        })
    } catch(e){
        c.status(411);
        return c.json({
            msg:"error happened. maybe it doesn't exist.?"
        })
    }
  })
  blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
    const blogs = await prisma.blog.findMany();
    return c.json({
        blogs 
    })
  })
  