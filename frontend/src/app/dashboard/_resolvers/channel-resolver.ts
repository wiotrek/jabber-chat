import { ResolveFn } from '@angular/router';

export const channelResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
