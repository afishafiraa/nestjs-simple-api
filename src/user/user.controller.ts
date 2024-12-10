import { Controller, Get, UseGuards, Req, Patch, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "@prisma/client";
import { Request } from "express";
import { GetUser } from "../auth/decarator";
import { JwtGuard } from '../auth/guard/jwt.guard';
import { EditUserDto } from "./dto";
import { UserService } from "./user.service";

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private usersService: UserService) {}
    @Get('me')
    getMe(@GetUser() user: User) { 
        return user;
    }

    @Patch()
    editUser(
        @GetUser('id') userId: number,
        @Body() dto: EditUserDto,
    ) {
        return this.usersService.editUser(userId, dto);
    }
}