import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateShopItemDto } from "./dto/create-shop-item.dto";
import { UpdateShopItemDto } from "./dto/update-shop-item.dto";
import { TelegramClientService } from "../telegram/telegram.service";

@Injectable()
export class ShopItemService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramClientService
  ) {}

  private serialize(item: any) {
    return {
      ...item,
      id: item.id.toString(),
      image_url: item.image_url ?? null,
    };
  }

  async create(data: CreateShopItemDto) {
    const item = await this.prisma.shop_item.create({ data });
    return this.serialize(item);
  }

  async findAll(medalType?: string) {
    const where = medalType ? { medal_type: medalType } : {};
    const items = await this.prisma.shop_item.findMany({ where });
    return items.map((item) => this.serialize(item));
  }

  async findOne(id: string) {
    const item = await this.prisma.shop_item.findUnique({
      where: { id: BigInt(id) },
    });
    if (!item) {
      throw new NotFoundException(`Shop item with id ${id} not found`);
    }
    return this.serialize(item);
  }

  async update(id: string, data: UpdateShopItemDto) {
    await this.findOne(id);
    const updated = await this.prisma.shop_item.update({
      where: { id: BigInt(id) },
      data,
    });
    return this.serialize(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    const deleted = await this.prisma.shop_item.delete({
      where: { id: BigInt(id) },
    });
    return this.serialize(deleted);
  }

  // Purchase method with Telegram notification to your account
  async purchaseItem(studentId: bigint, itemId: bigint) {
    // Find shop item
    const item = await this.prisma.shop_item.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException("Shop item not found");
    if (item.stock <= 0) throw new BadRequestException("Item is out of stock");

    // Find student's medal record for this medal type
    const medal = await this.prisma.base_medals.findFirst({
      where: { student_id: studentId, medal_type: item.medal_type },
    });
    if (!medal || medal.count < item.price)
      throw new BadRequestException("Not enough medals to purchase this item");

    // Transaction: update medal count and stock
    return this.prisma.$transaction(async (tx) => {
      await tx.base_medals.update({
        where: { id: medal.id },
        data: { count: medal.count - item.price },
      });

      await tx.shop_item.update({
        where: { id: itemId },
        data: { stock: item.stock - 1 },
      });

      // Get student info for message
      const student = await this.prisma.base_student.findUnique({
        where: { id: studentId },
        select: { name: true, surname: true, unique_id: true },
      });

      // Your Telegram chat ID or username (replace with your actual ID)
      const myTelegramChatId = "zayniddinovibrat"; // <-- PUT YOUR TELEGRAM CHAT ID HERE (number or string)

      // Compose notification message
      const message = `🛒 New Purchase Alert!\nStudent: ${student?.name || "Unknown"} ${
        student?.surname || ""
      } (ID: ${student?.unique_id || studentId.toString()})\nItem: "${item.name}"\nPrice: ${
        item.price
      } ${item.medal_type}\nRemaining stock: ${item.stock - 1}`;

      // Send message, but don't fail purchase if Telegram fails
      try {
        await this.telegramService.sendMessage(myTelegramChatId, message);
      } catch (err) {
        console.error("Telegram notification error:", err);
      }

      return { success: true, message: "Purchase successful" };
    });
  }
}
