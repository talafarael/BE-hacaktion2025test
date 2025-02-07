import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
const S3 = require('aws-sdk/clients/s3');
import * as Multer from 'multer';
import { create_photo } from 'src/utils/create_photo';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}
  async get(page, limit) {
    const skip = (page - 1) * limit;
    const [quiz, total] = await Promise.all([
      this.prisma.quiz.findMany({
        skip,
        take: limit,
      }),
      this.prisma.quiz.count(),
    ]);
    return {
      data: quiz,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async get_one(id) {
    try {
      const quiz = this.prisma.quiz.findFirst({
        where: {
          id: id,
        },
        include: { quests: true, questComplete: true },
      });
      return quiz;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async create_quiz(file: Multer.File, data, req) {
    try {
      let img = '';
      if (file?.mainImg && file.mainImg.length > 0) {
        img = await create_photo(file.mainImg[0]);
      }
      const time = new Date().toString();
      const quiz = await this.prisma.quiz.create({
        data: {
          title: data.title,
          description: data.description,
          img: img,
          time: time,
          quests: { connect: [] },
          questComplete: { connect: [] },
          authorId: req.id,
        },
      });
      console.log(quiz);
      return quiz;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }
  async remove_quiz(id, req) {
    try {
      await this.prisma.quiz.delete({
        where: {
          id: id,
          authorId: req.id,
        },
      });
      return 'remove successfully';
    } catch (e) {
      throw new NotFoundException(e);
    }
  }
}
