import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
export class MeController {
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        return {
            user: req.user,
        };
    }
}
