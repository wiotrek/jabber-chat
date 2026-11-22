import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Channel } from './channel';

describe('Messages', () => {
  let component: Channel;
  let fixture: ComponentFixture<Channel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Channel],
    }).compileComponents();

    fixture = TestBed.createComponent(Channel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
