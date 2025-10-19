import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import User from './user/entity/user.entity';
import { Link } from './link/entity/link.entity';
import { LinkUserBookmark } from './link/entity/link-user-bookmark.entity';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LinkModule } from './link/link.module';
import { Group } from './group/entity/group.entity';
import { GroupModule } from './group/group.module';
import { LinkCommentModule } from './linkComment/linkComment.module';
import { GroupUserBookmark } from './group/entity/group-user-bookmark.entity';
import { LinkComment } from './linkComment/entity/linkComment.entity';
import { Tag } from './tag/entity/tag.entity';
import { TagModule } from './tag/tag.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guard/Auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test.env' ? 'test.env' : '.env',
      validationSchema: Joi.object({
        ENV: Joi.string().valid('test', 'dev', 'prod').required(),
        // 네온 DB URL 또는 개별 DB 설정 중 하나는 필수
        DATABASE_URL: Joi.string().optional(),
        DB_TYPE: Joi.string().valid('postgres').when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DB_HOST: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DB_PORT: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DB_USERNAME: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DB_PASSWORD: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DB_DATABASE: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        BUCKET_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        // DATABASE_URL이 있으면 URL을 사용, 없으면 개별 설정 사용
        const baseConfig = databaseUrl
          ? {
              url: databaseUrl,
              type: configService.get<string>('DB_TYPE') as 'postgres',
            }
          : {
              type: configService.get<string>('DB_TYPE') as 'postgres',
              host: configService.get<string>('DB_HOST'),
              port: configService.get<number>('DB_PORT'),
              username: configService.get<string>('DB_USERNAME'),
              password: configService.get<string>('DB_PASSWORD'),
              database: configService.get<string>('DB_DATABASE'),
            };

        return {
          ...baseConfig,
          entities: [
            User,
            Link,
            LinkUserBookmark,
            Group,
            GroupUserBookmark,
            LinkComment,
            Tag,
          ],
          synchronize:
            configService.get<string>('ENV') === 'prod' ? false : true,
          ...(configService.get<string>('ENV') === 'prod' && {
            ssl: {
              rejectUnauthorized: false,
            },
          }),
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    LinkModule,
    GroupModule,
    LinkCommentModule,
    TagModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude(
        {
          path: 'auth/login',
          method: RequestMethod.POST,
        },
        {
          path: '/auth/register',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
