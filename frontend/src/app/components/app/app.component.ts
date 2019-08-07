import { Component, Inject } from '@angular/core';
import { ThemeService, SpinnerService } from '../../services';
import { SharedDataService } from '../../services/sharedData.service';
import { constants } from '../../constants';
@Component({
  selector: 'app-root',
  template: `<div *ngIf="spinnerService.showSpinner" class='app-spinner'>
<mat-spinner diameter="75" ></mat-spinner>
  </div><router-outlet></router-outlet> `,
  providers: [ThemeService]
})
export class AppComponent {
  constants = constants;
  constructor(private themeService: ThemeService, private sharedDataService: SharedDataService, public spinnerService: SpinnerService) {
    themeService.loadSavedTheme();
  }
}
