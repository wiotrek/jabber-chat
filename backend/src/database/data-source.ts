import 'reflect-metadata';
import '../env.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Message } from '../messages/entities/message.entity.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'jabber-chat',
  entities: [User, Message],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
