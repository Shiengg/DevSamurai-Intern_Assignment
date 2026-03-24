import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
    UserNotFoundException,
    UserAlreadyExistsException,
    InvalidCredentialsException
} from '../common/exceptions/auth.exceptions';


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new UserNotFoundException();
        }
        const { passwordhash, ...userDataWithoutPassword } = user;
        return userDataWithoutPassword;
    }

    async signUp(SignupDto: SignupDto) {
        const { name, email, password } = SignupDto;

        //Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        })
        if (existingUser) {
            throw new UserAlreadyExistsException();
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        //Create user 
        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                passwordhash: passwordHash,
            },
        });

        //Generate JWT token
        const payload = { sub: user.id, email: user.email, name: user.name };
        const token = this.jwtService.sign(payload);

        const { passwordhash, ...userDataWithoutPassword } = user;
        return {
            user: userDataWithoutPassword,
            token,
        }
    }

    async login(SigninDto: SigninDto) {
        const { email, password } = SigninDto;

        //Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
        })
        if (!user) {
            throw new InvalidCredentialsException();
        }

        //Compare password
        const isPasswordValid = await bcrypt.compare(password, user.passwordhash);

        if (!isPasswordValid) {
            throw new InvalidCredentialsException();
        }

        const payload = { sub: user.id, email: user.email, name: user.name };
        const token = this.jwtService.sign(payload);

        const { passwordhash, ...userDataWithoutPassword } = user;
        return {
            user: userDataWithoutPassword,
            token,
        }
    }
}
