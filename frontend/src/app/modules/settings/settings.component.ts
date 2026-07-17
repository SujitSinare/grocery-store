import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeStore } from '../../core/signals/theme.store';
import { AuthStore } from '../../core/signals/auth.store';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent {
  themeStore = inject(ThemeStore);
  authStore = inject(AuthStore);
}
export { SettingsComponent };
