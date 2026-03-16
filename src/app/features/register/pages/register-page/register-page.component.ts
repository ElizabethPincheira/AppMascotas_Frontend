import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {

  email: string = '';
  password: string = '';

  constructor(private userService: UsersService) { }

register() { const register = { email: this.email, password: this.password }; 

  console.log(register, 'register');}


}




