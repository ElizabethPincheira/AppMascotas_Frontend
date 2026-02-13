import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMascotaComponent } from './card-mascota.component';

describe('CardMascotaComponent', () => {
  let component: CardMascotaComponent;
  let fixture: ComponentFixture<CardMascotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMascotaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardMascotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
