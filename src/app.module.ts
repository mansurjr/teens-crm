import { Module } from "@nestjs/common";
import { StudentModule } from "./student/student.module";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from './auth/auth.module';
import { ShopItemModule } from './shop-item/shop-item.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [StudentModule, PrismaModule, AuthModule, ShopItemModule, TelegramModule, TelegramModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}