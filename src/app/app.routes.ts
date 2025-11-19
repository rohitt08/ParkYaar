import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './pages/layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: 'login',
        component: Login,
    },
    {
        path: '',
        component: Layout,
        children: [
            {
                path: 'dashboard',
                component: Dashboard,
            },
            {
                path: 'spot/:id',
                loadComponent: () => import('./pages/spot-detail/spot-detail').then((m) => m.SpotDetail),
            },
        ],
    },
   
    {
        path: 'history',
        loadComponent: () => import('./history/history').then((m) => m.History),
    },
    {
        path: 'reports',
        loadComponent: () => import('./reports/reports').then((m) => m.Reports),
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
    },
    {
        path: 'support',
        loadComponent: () => import('./pages/support/support').then((m) => m.Support),
    },
    {
        path: 'admin/support-requests',
        loadComponent: () => import('./pages/admin/support-requests/support-requests').then((m) => m.SupportRequests),
    },
];
