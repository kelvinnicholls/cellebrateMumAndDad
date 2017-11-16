import './polyfills';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'hammerjs';
import { AppModule } from "./app.module";
import { Consts } from "./shared/consts";

Consts.setUrlDomain('http://localhost:3000/');

platformBrowserDynamic().bootstrapModule(AppModule);