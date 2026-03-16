import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';

@Injectable({//
    providedIn: 'root'
})
export class UsersService {

    private apiUrl = 'http://localhost:3000/api/v1/user';

    async register(email: string, password: string, nombre: string, comuna: string, ciudad: string): Promise<any> {

        const registerData = { email, password, nombre, comuna, ciudad };
        const response = await axios.post(this.apiUrl, registerData);

        console.log(response.data, 'respuesta del backend');
        return response.data;
    }


    async login(email: string, password: string): Promise<any> {
      const loginData = { email, password };
      const response = await axios.post(`${this.apiUrl}/login`, loginData);

      console.log(response.data, 'respuesta del backend');
      return response.data;
    }

}








  /*



@Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.loginUsuario(loginUserDto);
  }




   @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    comuna: string;

    @IsString()
    ciudad: string;

    @IsNumber()
    @IsOptional()
    reputacion?: number;

    @IsDate()
    @IsOptional()
    fechaRegistro?: Date;

    @IsString()
    @IsOptional()
    @IsMongoId()
    ubicacion?: string; 
  
    @Post()
  crearUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.crearUser(createUserDto);
  }
  
  
  
  
  
  
  
  crear usuario
    @PostMapping("/register")
    @Operation(summary = "Registro de usuario", description = "Registra un nuevo usuario con email y contraseña")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = loginService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
        


      private apiUrl = 'http://localhost:8080/mascotas/';

  async getMascotas(): Promise<any[]> {
    let url = this.apiUrl + 'todas';
    const response = await axios.get(url);
    return response.data;
  }
    */