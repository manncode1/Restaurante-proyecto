
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  LOCALE_ID
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { routes } from './app.routes';

registerLocaleData(localeEsMx);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'es-MX' }
  ]
};
