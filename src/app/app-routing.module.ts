import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsOverviewComponent } from './settings/overview/overview.component';
import { RostaComponent } from './components/rosta/rosta.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  /**
   * @deprecated
   * Door does not have a dedicated route anymore
   * Redirect to dashboard
   */
  {
    path: 'door',
    redirectTo: 'dashboard'
  },
  {
    path: 'settings',
    component: SettingsOverviewComponent
  },
  {
    path: 'rosta',
    component: RostaComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
