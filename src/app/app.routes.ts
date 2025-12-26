import { Routes } from '@angular/router';
import { App } from './app';
import { UserListPage } from './pages/user-list-page/user-list-page';

export const routes: Routes = [
    { path: '', component: UserListPage }
];
