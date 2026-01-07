import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initForm();
  }

  // 🔹 Initialisation du formulaire
  private initForm(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      type: ['', Validators.required]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  // 🔹 Vérification mot de passe / confirmation
  private passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  // 🔹 Soumission du formulaire
  onSubmit(): void {
  if (this.registerForm.invalid) return;

  this.authService.register({
    name: this.registerForm.value.name!,
    email: this.registerForm.value.email!,
    password: this.registerForm.value.password!,
    type: this.registerForm.value.type!
  }).subscribe({
    next: () => {
      this.router.navigate(['/host/login']);
    },
    error: () => {
      alert('Erreur lors de l’inscription');
    }
  });
}
}
