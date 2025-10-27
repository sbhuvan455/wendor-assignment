import { Injectable, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDTO } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService
    ) { }

    async register(userDto: RegisterUserDto) {
        const newUser = await this.userService.createUser(userDto);

        if (!newUser) throw NotImplementedException;

        const payload = {
            userId: newUser.id,
        }

        return {
            user: newUser,
            token: await this.jwtService.signAsync(payload),
        }
    }

    async login(userDetails: LoginUserDTO) {
        const user = await this.userService.verifyUser(userDetails);

        if (!user) throw new NotImplementedException("User verification failed");

        const payload = {
            userId: user.id,
        }

        return {
            user,
            token: await this.jwtService.signAsync(payload),
        }
    }

    async getCurrentUser(userId: number) {
        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return { user };
    }

    async logout() {
        return { message: 'Logged out successfully' };
    }
}
