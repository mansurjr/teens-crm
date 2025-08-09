import { Module } from "@nestjs/common";
import { ShopItemService } from "./shop-item.service";
import { ShopItemController } from "./shop-item.controller";
import { TelegramModule } from "../telegram/telegram.module";

@Module({
  controllers: [ShopItemController],
  providers: [ShopItemService],
  imports: [TelegramModule],
})
export class ShopItemModule {}
