import { Body, Controller, Post, Get, Res, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SelectRoleDto } from './dto/select-role.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { Response, Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(dto);
        // Set cookie for 7 days
        // Use secure: true in production (HTTPS), false in development
        const isProduction = process.env.NODE_ENV === 'production';
        const isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';
        res.cookie('auth_token', result.token, {
            httpOnly: true,
            secure: isProduction || isHttps, // true for HTTPS
            sameSite: (isProduction || isHttps) ? 'none' : 'lax', // 'none' required for cross-origin, but needs secure: true
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        return { message: result.message, user: result.user };
    }

    /**
     * GET /auth/me - Get authenticated user's roles from JWT
     * Accessible to all authenticated users
     */
    @Public()
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user roles from JWT token' })
    async getMe(@Req() req: Request) {
        const user = req.user as any; // Type from JwtStrategy: {_id, roles}

        // Defensive check: ensure user exists
        if (!user || !user._id) {
            throw new UnauthorizedException('User not authenticated. Please login again.');
        }

        // Fetch latest roles from database
        const roles = await this.authService.getMyRoles(user._id.toString());

        return {
            id: user._id,
            roles,
        };
    }

    /**
     * POST /auth/select-role - Store current role in HTTP-only cookie
     * Validates that the selected role exists in user's JWT roles
     */
    @Post('select-role')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Select and store current role in secure cookie' })
    async selectRole(
        @Body() dto: SelectRoleDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // Debug logging
        console.log('[selectRole] Request received:', {
            hasCookies: !!req.cookies,
            cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
            hasAuthToken: !!req.cookies?.auth_token,
            hasUser: !!req.user,
            body: dto,
        });

        const user = req.user as any; // {_id, roles} from JwtStrategy

        // Defensive check: ensure user and roles exist
        if (!user) {
            console.error('[selectRole] No user found in request');
            throw new UnauthorizedException('User not authenticated. Please login again.');
        }

        if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
            throw new UnauthorizedException('User has no assigned roles. Please contact administrator.');
        }

        // Validate role exists in user's JWT roles
        const isValid = this.authService.validateRoleSelection(user.roles, dto.role);

        if (!isValid) {
            throw new UnauthorizedException(
                `Role "${dto.role}" is not assigned to this user. Valid roles: ${user.roles.join(', ')}`
            );
        }

        // Store in HTTP-only cookie (7 days, same as auth_token)
        const isProduction = process.env.NODE_ENV === 'production';
        const isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';
        res.cookie('current_role', dto.role, {
            httpOnly: true,
            secure: isProduction || isHttps, // true for HTTPS
            sameSite: (isProduction || isHttps) ? 'none' : 'lax', // 'none' required for cross-origin, but needs secure: true
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        return {
            message: 'Current role set successfully',
            currentRole: dto.role,
        };
    }

    /**
     * GET /auth/current-role - Retrieve stored current role from cookie
     */
    @Get('current-role')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current role from secure cookie' })
    async getCurrentRole(@Req() req: Request) {
        const currentRole = req.cookies?.current_role || null;
        const user = req.user as any;

        // Defensive check: ensure user exists
        if (!user || !user.roles || !Array.isArray(user.roles)) {
            throw new UnauthorizedException('User not authenticated or has no roles.');
        }

        // If no current role in cookie, or invalid, return first role
        if (!currentRole || !user.roles.includes(currentRole)) {
            return {
                currentRole: user.roles[0] || null,
                source: 'default', // Indicates fallback to first role
            };
        }

        return {
            currentRole,
            source: 'cookie',
        };
    }

    /**
     * POST /auth/logout - Clear auth cookies
     */
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout and clear authentication cookies' })
    async logout(@Res({ passthrough: true }) res: Response) {
        // Clear both auth_token and current_role cookies
        res.clearCookie('auth_token', { path: '/' });
        res.clearCookie('current_role', { path: '/' });

        return { message: 'Logged out successfully' };
    }
}
