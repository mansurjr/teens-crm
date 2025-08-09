import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SignInDto } from "./dto/signIn-dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signIn(dto: SignInDto) {
    const student = await this.prisma.base_student.findUnique({
      where: {
        unique_id: dto.uniqueId,
      },
    });

    if (!student || !student.password) {
      throw new NotFoundException("Id or password is incorrect");
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      student.password
    );
    if (!passwordMatches) {
      throw new UnauthorizedException("Id or password is incorrect");
    }

    return {
      message: "Sign in successful",
      studentId: student.id.toString(),
      name: student.name,
      surname: student.surname,
    };
  }
}