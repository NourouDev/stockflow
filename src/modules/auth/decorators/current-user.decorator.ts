import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the authenticated user (JWT payload) from the request.
 * Usage: @CurrentUser() user: JwtPayload
 * Usage with property: @CurrentUser('sub') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // request.user is the JwtPayload from the strategy validate() method
    return data ? user?.[data] : user;
  },
);