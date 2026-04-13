import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-placeholder.component.html',
  styleUrls: ['./checkout-placeholder.component.css']
})
export class CheckoutPlaceholderComponent {}
