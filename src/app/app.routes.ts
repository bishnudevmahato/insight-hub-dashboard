import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { Component } from '@angular/core';

export const routes: Routes = [

  // Lazy Routing Dashboard Component
  { path: '', loadComponent: () => import('./components/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent) },
];