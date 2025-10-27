import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator";
import { ServiceType, UserRole } from "generated/prisma";

export class RegisterUserDto {

    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name should not be empty' })
    name: string;

    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email should not be empty' })
    email: string;

    // @IsStrongPassword()
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty()
    password: string

    @IsString({ message: 'Role must be a string' })
    @IsEnum(UserRole, { message: 'Role must be either customer or provider' })
    role?: "customer" | "provider";

    @IsOptional()
    @IsEnum(ServiceType, { message: 'Invalid service type' })
    serviceType?: "Electrician" | "Carpentry" | "CarWasher" | "Plumbing" | "ApplianceRepair";
}