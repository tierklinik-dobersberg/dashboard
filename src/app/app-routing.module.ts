import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DoorComponent } from './door/door.component';
import { SettingsOverviewComponent } from './settings/overview/overview.component';

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
    path: '**',
    redirectTo: 'door'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
