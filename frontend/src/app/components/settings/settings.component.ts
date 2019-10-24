import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import 'rxjs/add/operator/filter';
import { ThemeService } from '../../services';
import { HttpService } from '../../services/http.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  providers: [ThemeService]
})
export class SettingsComponent {

  themes: Array<any> = [];

  selectedTheme: any;
  isFullWidth: boolean = true;
  is_ip_restriction_active = true;
  constructor(private themeService: ThemeService, private snackBar: MatSnackBar, private http: HttpService) {
    this.themes = themeService.themes;
    this.selectedTheme = themeService.currentTheme();
    this.http.get('api/settings/').subscribe((res) => {
      this.is_ip_restriction_active = res;
    })
    this.isFullWidth = themeService.isFullWidth();
  }

  onThemeSelected(theme: any) {
    this.themeService.setTheme(theme);

    this.snackBar.open(`Theme changed to "${theme.name}"`, null, {
      duration: 3000
    });
  }

  setFullWidth(isFullWidth: boolean) {
    this.themeService.setFullWidth(isFullWidth);
  }
  updateIpRestriction(setting) {
    this.http.post('api/settings/', { 'is_ip_restriction_active': setting }).subscribe((res) => {

    });
  }

}
