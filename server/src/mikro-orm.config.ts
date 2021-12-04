import dotenv from 'dotenv';
import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path"
import { User } from './entities/User';

dotenv.config()

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    dbName: process.env.POSTGRES_DBNAME,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    type: 'postgresql',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]