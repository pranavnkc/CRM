import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";
import { NgxMaskModule } from 'ngx-mask';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatTooltipModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatMenuModule,
  MatSidenavModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatSlideToggleModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSelectModule,
  MatRadioModule,
  MatGridListModule,
  MatProgressBarModule,
  MatListModule,
  MatCardModule,
  MatDialogModule,
  MatTabsModule,
  MatChipsModule,
  MatSnackBarModule
} from '@angular/material';

import { ChartsModule } from 'ng2-charts';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgProgressModule, NgProgressInterceptor } from 'ngx-progressbar';

import { HttpService } from './services';

import { NgInitDirective } from './directives/ng-init.directive';

import { NavBarComponent } from './components/shared/navbar/navbar.component';
import { ToolbarComponent } from './components/shared/toolbar/toolbar.component';
import { AppComponent } from './components/app/app.component';

import { HomeComponent } from './components/home/home.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/users/list/user-list.component';
import { UserDetailsComponent } from './components/users/details/user-details.component';
import { CreateEditUserComponent } from './components/users/shared/create-edit-user/create-edit-user.component';
import { LeadListComponent } from './components/lead/list/lead-list.component';
import { LeadDetailsComponent } from './components/lead/details/lead-details.component';
import { CreateEditLeadComponent } from './components/lead/shared/create-edit-lead/create-edit-lead.component';

import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LayoutComponent } from './components/layout/base/layout.component';
import { AlertsLayoutComponent } from './components/layout/alerts-layout/alerts-layout.component';
import { ButtonsLayoutComponent } from './components/layout/buttons-layout/buttons-layout.component';
import { TypographyComponent } from './components/layout/typography/typography.component';
import { ConfirmDialogComponent } from './components/dialogs/confirm-dialog/confirm-dialog.component';
import { AuthGuard } from './services/auth.guard';
import { AuthService, UsernameAlreadyExistsValidator } from './services/auth.service';

const appRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/home' },
      { path: 'home', component: HomeComponent, data: { title: 'Dashboard' } },
      { path: 'users', component: UserListComponent, data: { title: 'Users' } },
      { path: 'users/new', component: CreateEditUserComponent, data: { title: 'New user' } },
      { path: 'users/edit/:id', component: CreateEditUserComponent, data: { title: 'Edit user' } },
      { path: 'users/details/:id', component: UserDetailsComponent, data: { title: 'User details' } },
      { path: 'leads', component: LeadListComponent, data: { title: 'Leads' } },
      { path: 'leads/new', component: CreateEditLeadComponent, data: { title: 'New Lead' } },
      { path: 'leads/edit/:id', component: CreateEditLeadComponent, data: { title: 'Edit Lead' } },
      { path: 'leads/details/:id', component: LeadDetailsComponent, data: { title: 'Lead details' } },
      { path: 'settings', component: SettingsComponent, data: { title: 'Settings' } },
      { path: 'profile', component: ProfileComponent, data: { title: 'Profile' } },
      {
        path: 'layout', data: { title: 'Layout' },
        children: [
          { path: 'base', component: LayoutComponent, data: { title: 'Base layout' } },
          { path: 'alerts', component: AlertsLayoutComponent, data: { title: 'Alerts & Callouts' } },
          { path: 'buttons', component: ButtonsLayoutComponent, data: { title: 'Buttons' } },
          { path: 'typography', component: TypographyComponent, data: { title: 'Typography' } }
        ]
      }
    ]
  },
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      }
    ]
  },
  { path: '**', redirectTo: '/home' }

];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MainLayoutComponent,
    NavBarComponent,
    LoginLayoutComponent,
    LoginComponent,
    UserListComponent,
    LeadListComponent,
    ToolbarComponent,
    UserDetailsComponent,
    LeadDetailsComponent,
    SettingsComponent,
    ProfileComponent,
    NgInitDirective,
    LayoutComponent,
    CreateEditUserComponent,
    CreateEditLeadComponent,
    AlertsLayoutComponent,
    ButtonsLayoutComponent,
    TypographyComponent,
    ConfirmDialogComponent,
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    HttpClientModule,
    NgProgressModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatMenuModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCardModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatRadioModule,
    MatListModule,
    MatGridListModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTabsModule,
    MatChipsModule,
    ChartsModule,
    FlexLayoutModule,
    RoundProgressModule,
    NgxMaskModule.forRoot({}),
  ],
  providers: [
    HttpService,
    AuthService,
    AuthGuard,
    UsernameAlreadyExistsValidator,
    Title,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgProgressInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmDialogComponent]
})
export class AppModule { }
