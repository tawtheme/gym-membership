import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  mobileNumber: string = '';
  pin: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tabs']);
    }
  }

  async onLogin() {
    if (!this.mobileNumber || !this.pin) {
      this.showToast('Please fill in all fields', 'danger');
      return;
    }

    if (this.pin.length !== 4) {
      this.showToast('PIN must be 4 digits', 'danger');
      return;
    }

    this.isLoading = true;

    try {
      const success = await this.authService.login(this.mobileNumber, this.pin);
      
      if (success) {
        this.showToast('Login successful!', 'success');
        this.router.navigate(['/tabs']);
      } else {
        this.showToast('Invalid credentials', 'danger');
      }
    } catch (error) {
      this.showToast('Login failed. Please try again.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }


  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
