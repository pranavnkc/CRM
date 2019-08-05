import { Component, Inject } from '@angular/core';
import { ThemeService } from '../../services';
import { SharedDataService } from '../../services/sharedData.service';
console.log(SharedDataService)
@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  providers: [ThemeService]
})
export class AppComponent {

  constructor(private themeService: ThemeService, private sharedDataService: SharedDataService) {
    themeService.loadSavedTheme();
  }
}
