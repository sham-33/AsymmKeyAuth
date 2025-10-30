import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth.module';
import { UserModule } from './modules/user.module';
import { User } from './entities/user.entity';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.db_host,
      port: parseInt(process.env.db_port || '5432', 10),
      username: process.env.db_username,
      password: process.env.db_password,
      database: process.env.db_database,
      entities: [User],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    KafkaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
