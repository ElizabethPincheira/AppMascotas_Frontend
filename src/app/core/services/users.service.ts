import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';

@Injectable({//
    providedIn: 'root'
})
export class UsersService {

    private apiUrl = 'http://localhost:8080/auth/register';

}








  /*crear usuario
    @PostMapping("/register")
    @Operation(summary = "Registro de usuario", description = "Registra un nuevo usuario con email y contraseña")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = loginService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
        */