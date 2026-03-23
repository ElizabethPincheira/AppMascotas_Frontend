import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiUserComponent } from './mi-user.component';

describe('MiUserComponent', () => {
  let component: MiUserComponent;
  let fixture: ComponentFixture<MiUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
