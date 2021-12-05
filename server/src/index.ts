import "reflect-metadata"
import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
// import { Post } from './entities/Post'
import mikroConfig from './mikro-orm.config'
import express from 'express'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from "./resolvers/user"

import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { MyContext } from "./types"

const main = async () => {
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up()

    const app = express()

    const RedisStore = connectRedis(session)
    const redisClient = new Redis(14584, 'redis-14584.c264.ap-south-1-1.ec2.cloud.redislabs.com', {password: 'GqbU8YqB8blnJsOaEGit32oxDXOJDuFy'})

    const whitelist = ['http://localhost:3000'];
    app.use(cors({
        origin: function (origin, callback) {
            if (!__prod__) {
                return callback(null, true);
            }
    
            if (origin && whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error(`${origin} : Not allowed by CORS`));
            }
        },
        credentials: true,
        })
    )
    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: "none", // csrf
                secure: true,
            },
            saveUninitialized: false,
            secret: 'deveshb',
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
    })
    await apolloServer.start()
    apolloServer.applyMiddleware({ 
        app,
        cors: false 
    })

    app.listen(4000, () => {
        console.log('Server listening on port 4000')
    })
}

main().catch(error => console.error(error))