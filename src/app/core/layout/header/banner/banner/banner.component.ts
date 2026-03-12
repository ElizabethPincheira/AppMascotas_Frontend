import { Component } from '@angular/core';
import { ButtonCtaComponent } from '../../../../../shared/atoms/button_cta/button-cta/button-cta.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner',
  imports: [ButtonCtaComponent, RouterLink],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {

}
