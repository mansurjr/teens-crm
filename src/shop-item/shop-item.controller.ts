import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

import { ShopItemService } from "./shop-item.service";
import { CreateShopItemDto } from "./dto/create-shop-item.dto";
import { UpdateShopItemDto } from "./dto/update-shop-item.dto";

@Controller("shop-items")
export class ShopItemController {
  constructor(private readonly shopItemService: ShopItemService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error("Only image files are allowed!"), false);
        }
        cb(null, true);
      },
    })
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const createShopItemDto: CreateShopItemDto = {
      ...body,
      stock: body.stock !== undefined ? parseInt(body.stock, 10) : 0,
      price: body.price !== undefined ? parseInt(body.price, 10) : 0,
      image_url: file ? `/uploads/${file.filename}` : null,
    };

    return this.shopItemService.create(createShopItemDto);
  }

  @Get()
  findAll(@Query("medalType") medalType?: string) {
    return this.shopItemService.findAll(medalType);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.shopItemService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error("Only image files are allowed!"), false);
        }
        cb(null, true);
      },
    })
  )
  async update(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    const updateShopItemDto: UpdateShopItemDto = {
      ...body,
      stock: body.stock !== undefined ? parseInt(body.stock, 10) : undefined,
      price: body.price !== undefined ? parseInt(body.price, 10) : undefined,
      ...(file ? { image_url: `/uploads/${file.filename}` } : {}),
    };

    return this.shopItemService.update(id, updateShopItemDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.shopItemService.remove(id);
  }
  @Post(":id/purchase/:studentId")
  async purchaseItem(
    @Param("id") itemId: string,
    @Param("studentId") studentId: string
  ) {
    return this.shopItemService.purchaseItem(BigInt(studentId), BigInt(itemId));
  }
}