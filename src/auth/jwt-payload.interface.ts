import { User } from "src/users/user.entity";


export interface JwtPayload {
    sub: string;
    user: User;
}