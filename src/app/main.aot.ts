import './polyfills';
import { platformBrowser } from "@angular/platform-browser";
import { enableProdMode } from "@angular/core";
import 'hammerjs';
import { AppModuleNgFactory } from './app.module.ngfactory';

import { Consts } from "./shared/consts";

Consts.setUrlDomain('https://celeb-mum-and-dad.herokuapp.com/');

enableProdMode();

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);