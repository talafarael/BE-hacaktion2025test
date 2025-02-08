import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async get_user(req) {
    try {
      const user = this.prisma.user.findFirst({
        where: {
          id: req.id,
        },
        include: { yourQuiz: true, questComplete: true },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }
}
