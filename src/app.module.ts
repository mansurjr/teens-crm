import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { StudentModule } from "./student/student.module";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ShopItemModule } from "./shop-item/shop-item.module";
import { TelegramModule } from "./telegram/telegram.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"), // absolute path to your uploads folder
      serveRoot: "/uploads", // URL prefix
      serveStaticOptions: {
        index: false,
      },
    }),
    StudentModule,
    PrismaModule,
    AuthModule,
    ShopItemModule,
    TelegramModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
