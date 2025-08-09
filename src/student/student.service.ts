import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}
  // create(createStudentDto: CreateStudentDto) {
  //   return 'This action adds a new student';
  // }

  async findAll(n?: number) {
    const students = await this.prisma.base_student.findMany({
      include: {
        base_medals: true,
      },
    });

    const studentsWithTotal = students.map((student) => {
      const totalMedals = student.base_medals.reduce(
        (sum, medal) => sum + medal.count,
        0
      );

      return {
        ...student,
        id: student.id.toString(),
        group_id: student.group_id.toString(),
        base_medals: student.base_medals.map((medal) => ({
          ...medal,
          id: medal.id.toString(),
          student_id: medal.student_id.toString(),
        })),
        totalMedals,
      };
    });

    // Sort by totalMedals descending
    studentsWithTotal.sort((a, b) => b.totalMedals - a.totalMedals);

    // If n is not provided or invalid, return all students
    if (!n || n <= 0) {
      return studentsWithTotal.map(({ totalMedals, ...rest }) => rest);
    }

    // Otherwise return top n students
    const topStudents = studentsWithTotal.slice(0, n);
    return topStudents.map(({ totalMedals, ...rest }) => rest);
  }

  async findOne(id: number) {
    const student = await this.prisma.base_student.findUnique({
      where: { id: BigInt(id) },
      include: { base_medals: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return {
      ...student,
      id: student.id.toString(),
      group_id: student.group_id.toString(),
      base_medals: student.base_medals.map((medal) => ({
        ...medal,
        id: medal.id.toString(),
        student_id: medal.student_id.toString(),
      })),
    };
  }

  // update(id: number, updateStudentDto: UpdateStudentDto) {
  //   return `This action updates a #${id} student`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} student`;
  // }
}
