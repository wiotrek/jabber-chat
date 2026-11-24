import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChannelNew } from './channel-new';

describe('ChannelNew', () => {
  let component: ChannelNew;
  let fixture: ComponentFixture<ChannelNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChannelNew],
    }).compileComponents();

    fixture = TestBed.createComponent(ChannelNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
