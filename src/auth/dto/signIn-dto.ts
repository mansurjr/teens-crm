import { IsNotEmpty } from "class-validator";

export class SignInDto {
  @IsNotEmpty()
  uniqueId: string;
  @IsNotEmpty()
  password: string;
}
