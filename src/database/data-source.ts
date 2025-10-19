import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      url: process.env.DATABASE_URL,
      type: 'postgres',
      synchronize: false,
      logging: false,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
    }
  : {
      type: process.env.DB_TYPE as 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: false,
      logging: false,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
    };

export default new DataSource(dataSourceOptions);
