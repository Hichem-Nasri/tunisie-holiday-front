import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';

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
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const registerData = {
      email: this.registerForm.value.email,
      name: this.registerForm.value.name,
      password: this.registerForm.value.password,
      type: this.registerForm.value.type
    };

    console.log('Register data:', registerData);

    // 🔸 MOCK API CALL
    setTimeout(() => {
      this.isSubmitting = false;

      // Redirection vers login après inscription
      this.router.navigate(['/host/login']);
    }, 800);
  }
}
