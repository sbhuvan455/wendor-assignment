import { Body, Controller, Post, Res, Get, Req } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { setPublic } from 'src/decorators/public.decorator';
import { LoginUserDTO } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @setPublic()
    @Post('register')
    async register(@Body() userInfo: RegisterUserDto) {
        console.log(userInfo);
        const { user, token } = await this.authService.register(userInfo);
        // const options = {
        //     httpOnly: true,
        //     secure: true
        // };

        // return res.status(201).cookie("access_token", token, options).json({ user });
        return { user, token };
    }

    @setPublic()
    @Post('login')
    async login(@Body() userInfo: LoginUserDTO) {
        const { user, token } = await this.authService.login(userInfo);
        // const options = {
        //     httpOnly: true,
        //     secure: true
        // };

        // return res.status(200).cookie("access_token", token, options).json({ user });
        return { user, token };
    }

    @Get('me')
    async getCurrentUser(@Req() req) {
        console.log("calling me endpoint");
        const userId = req.user.userId;
        return await this.authService.getCurrentUser(userId);
    }

    @Post('logout')
    async logout(@Res() res) {
        const options = {
            httpOnly: true,
            secure: true,
            expires: new Date(0)
        };

        return res.status(200)
            .cookie("access_token", "", options)
            .json(await this.authService.logout());
    }
}
