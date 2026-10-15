import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { PublicUser } from '../../users/user.presenter.js';

/** Available on any route behind JwtAuthGuard; set by JwtStrategy.validate(). */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): PublicUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);
