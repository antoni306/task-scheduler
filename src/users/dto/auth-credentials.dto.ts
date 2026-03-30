
import { IsString, Matches, MaxLength, MinLength } from "class-validator";
export class AuthCredentialsDto {
    @MinLength(4)
    @MaxLength(20)
    @IsString()
    username: string;
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
    password: string;
}