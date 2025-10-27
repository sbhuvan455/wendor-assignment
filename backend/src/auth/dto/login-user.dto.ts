import { IsNotEmpty, IsString } from "class-validator";

export class LoginUserDTO {
    @IsString()
    @IsNotEmpty({ message: 'Email should not be empty' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password should not be empty' })
    password: string;
}