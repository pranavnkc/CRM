import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";
import { NgxMaskModule } from 'ngx-mask';
import { MAT_DATE_FORMATS } from '@angular/material/core';
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
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
  MatSnackBarModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
} from '@angular/material';

import { ChartsModule } from 'ng2-charts';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgProgressModule, NgProgressInterceptor } from 'ngx-progressbar';

import { HttpService, AppLoadService } from './services';
import { SnackBarService, SpinnerService, FileLoaderService } from './services';

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
import { PromptDialogComponent } from './components/dialogs/prompt-dialog/prompt-dialog.component';
import { AuthGuard } from './services/auth.guard';
import { AuthService, UsernameAlreadyExistsValidator } from './services/auth.service';
import { UserResolver } from './components/users/services/user.service';
import { SharedDataService } from './services/sharedData.service';
import { LeadAssignComponent } from './components/lead/lead-assign/lead-assign.component';
import { CallbackComponent } from './components/lead/callback/callback.component';
import { LeadBulkCreateComponent } from './components/lead/lead-bulk-create/lead-bulk-create.component';
import { Page403Component } from './page-403/page-403.component';
import { ReportsComponent } from './components/reports/reports.component';
import { PrSubmissionComponent } from './components/lead/pr-submission/pr-submission.component';
import { AlertDialogComponent } from './components/dialogs/alert-dialog/alert-dialog.component';
import { SaleComponent } from './components/lead/sale/sale.component';
import { SaleListComponent } from './components/sales/sale-list/sale-list.component';
import { PrListComponent } from './components/pr/list/list.component';
import { PrHtSalesReportComponent } from './components/reports/pr-ht-sales-report/pr-ht-sales-report.component';
import { FilterItemDirective } from './components/lead/filter-item.directive.directive';
const appRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/home' },
      { path: 'home', component: HomeComponent, data: { title: 'Dashboard' } },
      { path: 'users', canActivate: [AuthGuard], component: UserListComponent, data: { title: 'Users' } },
      { path: 'users/new', canActivate: [AuthGuard], component: CreateEditUserComponent, data: { title: 'New user' }, resolve: { "users": UserResolver } },
      { path: 'users/edit/:id', canActivate: [AuthGuard], component: CreateEditUserComponent, data: { title: 'Edit user' } },
      { path: 'users/details/:id', canActivate: [AuthGuard], component: UserDetailsComponent, data: { title: 'User details' } },
      { path: 'users/:id/dashboard', canActivate: [AuthGuard], component: HomeComponent, data: { title: 'User Dashboard' } },
      { path: 'leads', component: LeadListComponent, data: { title: 'Leads' } },
      { path: 'leads/new', component: CreateEditLeadComponent, data: { title: 'New Lead' } },
      { path: 'leads/bulk-create', component: LeadBulkCreateComponent, data: { title: ' Bulk Create Lead' } },
      { path: 'leads/edit/:id', component: CreateEditLeadComponent, data: { title: 'Edit Lead' } },
      { path: 'leads/details/:id', component: LeadDetailsComponent, data: { title: 'Lead details' } },
      { path: 'logs', canActivate: [AuthGuard], component: ReportsComponent, data: { title: 'Logs' } },
      { path: 'report/:report_type', canActivate: [AuthGuard], component: PrHtSalesReportComponent, data: { title: 'Reports' } },
      { path: 'sales/:status', canActivate: [AuthGuard], component: SaleListComponent, data: { title: 'Sale' } },
      { path: 'pr/:status', canActivate: [AuthGuard], component: PrListComponent, data: { title: 'PR' } },
      { path: 'ht/:status', canActivate: [AuthGuard], component: PrListComponent, data: { title: 'HT' } },
      { path: 'sales/edit/:id', canActivate: [AuthGuard], component: SaleComponent, data: { title: 'Sale Edit' } },
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
  { path: '403', component: Page403Component },
  { path: '**', redirectTo: '/home' }

];

export function get_ip(appLoadService: AppLoadService) {
  return () => appLoadService.loadConfigurationData();
}

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
    PromptDialogComponent,
    LeadAssignComponent,
    CallbackComponent,
    LeadBulkCreateComponent,
    Page403Component,
    ReportsComponent,
    PrSubmissionComponent,
    AlertDialogComponent,
    SaleComponent,
    SaleListComponent,
    PrListComponent,
    PrHtSalesReportComponent,
    FilterItemDirective,
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
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    ChartsModule,
    FlexLayoutModule,
    RoundProgressModule,
    NgxMaskModule.forRoot({}),
  ],
  providers: [
    HttpService,
    SnackBarService,
    AppLoadService,
    { provide: APP_INITIALIZER, useFactory: get_ip, deps: [AppLoadService], multi: true },
    SpinnerService,
    FileLoaderService,
    AuthService,
    AuthGuard,
    UserResolver,
    UsernameAlreadyExistsValidator,
    SharedDataService,
    Title,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgProgressInterceptor,
      multi: true
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmDialogComponent, PromptDialogComponent, AlertDialogComponent, LeadAssignComponent, CallbackComponent, SaleComponent]
})
export class AppModule { }
