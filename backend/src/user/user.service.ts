import { Injectable, NotAcceptableException } from '@nestjs/common';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from 'src/auth/dto/login-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(user: RegisterUserDto) {
        // check if user with email already exists
        // hash the password
        // store the user in the database
        // return the user and the token

        const existingUser = await this.prisma.user.findUnique({
            where: { email: user.email },
        })

        if (existingUser) throw new NotAcceptableException('User with this email already exists');

        if (user.role && user.role === "provider" && !user.serviceType) throw new NotAcceptableException("Service type is required for providers");

        const hashedPassword = bcrypt.hashSync(user.password, 10);

        const newUser = await this.prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role ?? 'customer',
                serviceType: user.serviceType ?? null,
            },
        });

        return newUser;
    }

    async verifyUser(userDetails: LoginUserDTO) {
        const user = await this.prisma.user.findUnique({
            where: { email: userDetails.email },
        });

        if (!user) throw new NotAcceptableException('Invalid email or password');
        const isPasswordValid = bcrypt.compareSync(userDetails.password, user.password);

        if (!isPasswordValid) throw new NotAcceptableException('Invalid email or password');

        return user;
    }

    async getUserById(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                serviceType: true,
            }
        })

        if (!user) throw new NotAcceptableException('User not found');
        return user;
    }
}
