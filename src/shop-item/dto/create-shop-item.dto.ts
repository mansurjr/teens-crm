import { IsInt, Min, IsString, MaxLength, IsOptional } from "class-validator";

export class CreateShopItemDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  medal_type: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  image_url?: string | null;
}
