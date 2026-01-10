import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register.component';
import { LoginComponent } from './pages/login.component';
import { VerifyComponent } from './pages/verify.component';
import { HomeComponent } from './pages/home.component';
import { authGuard } from './guards/auth.guard';
import { AdminComponent } from './pages/admin.component';
import { ForgotPasswordComponent } from './pages/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password.component';
import { AdminGuard } from './guards/admin.guard';
import { ProfileComponent } from './pages/profile.component';
import { CheckoutComponent } from './pages/checkout.component';
import { StoreComponent } from './pages/store.component';

export const routes: Routes = [
  { path: '', redirectTo: 'store', pathMatch: 'full' },

  // PUBLIC ROUTES
  { path: 'store', component: StoreComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {path:'reset-password',component:ResetPasswordComponent},
  { path: 'checkout', component: CheckoutComponent },

  // PROTECTED ROUTES
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: HomeComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  


  // FALLBACK
  { path: '**', redirectTo: 'login' }
];
