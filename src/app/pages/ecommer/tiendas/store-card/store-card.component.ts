import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryStore, StoreScheduleEntry } from '../delivery-store.model';

@Component({
  selector: 'app-store-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './store-card.component.html',
  styleUrls: ['./store-card.component.css']
})
export class StoreCardComponent {
  @Input({ required: true }) store!: DeliveryStore;
  showWeeklySchedule = false;

  private readonly dayOrder = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
  ];

  get todaySchedule(): string {
    const today = this.dayOrder[new Date().getDay()];
    const entry = this.store.weeklySchedule.find((item) => item.dia === today);

    if (!entry) {
      return 'Horario no informado hoy';
    }

    if (!entry.abierto) {
      return 'Hoy cerrado';
    }

    return `Hoy ${entry.apertura} - ${entry.cierre}`;
  }

  get orderedWeeklySchedule(): StoreScheduleEntry[] {
    return [...this.store.weeklySchedule].sort(
      (a, b) => this.dayOrder.indexOf(a.dia) - this.dayOrder.indexOf(b.dia)
    );
  }

  toggleWeeklySchedule(): void {
    this.showWeeklySchedule = !this.showWeeklySchedule;
  }
}
