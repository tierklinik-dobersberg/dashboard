import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DoorComponent } from './door/door.component';
import { SettingsOverviewComponent } from './settings/overview/overview.component';
import { RostaComponent } from './components/rosta/rosta.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: 'door',
    component: DoorComponent
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
    path: '**',
    redirectTo: 'door'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
