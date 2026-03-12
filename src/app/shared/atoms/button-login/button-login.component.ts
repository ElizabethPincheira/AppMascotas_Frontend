import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-button-login',
  imports: [CommonModule, RouterLink],
  templateUrl: './button-login.component.html',
  styleUrl: './button-login.component.css'
})
export class ButtonLoginComponent {

  @Input() routerLink?: string;
  @Input() label: string = 'Button';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: string = 'primary'; // primary, secondary, danger...
  @Input() disabled: boolean = false;
  @Input() buttonClass: string = '';
}


