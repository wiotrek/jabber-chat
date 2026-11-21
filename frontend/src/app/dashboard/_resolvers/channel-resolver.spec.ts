import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { channelResolver } from './channel-resolver';

describe('channelResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => channelResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
