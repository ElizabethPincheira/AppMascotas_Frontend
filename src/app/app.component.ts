import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent } from './shared/atoms/button/button.component';
import { CardMascotaComponent } from './shared/molecules/card-mascota/card-mascota.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonComponent,CardMascotaComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
}
