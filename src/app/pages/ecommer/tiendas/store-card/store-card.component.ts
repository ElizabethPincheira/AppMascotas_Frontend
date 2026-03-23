import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryStore } from '../delivery-store.model';

@Component({
  selector: 'app-store-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './store-card.component.html',
  styleUrls: ['./store-card.component.css']
})
export class StoreCardComponent {
  @Input({ required: true }) store!: DeliveryStore;
}
