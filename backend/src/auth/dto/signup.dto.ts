import  {IsEmail, IsString, MinLength, IsNotEmpty} from 'class-validator';

export class SignupDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}