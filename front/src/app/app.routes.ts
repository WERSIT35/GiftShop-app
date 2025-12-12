import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register.component';
import { LoginComponent } from './pages/login.component';
import { VerifyComponent } from './pages/verify.component';
import { HomeComponent } from './pages/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // PUBLIC ROUTES
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'verify', component: VerifyComponent },

  // PROTECTED ROUTES
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: HomeComponent, canActivate: [authGuard] },

  // FALLBACK
  { path: '**', redirectTo: 'login' }
];
