import {Router, RouterConfiguration} from 'aurelia-router';

export class App {
  router: Router;
  
  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'RULES';
    config.map([
      { route: ['', 'map'],   name: 'mao',        moduleId: './map/map',             nav: true, title: 'Map' },
      { route: 'rules',       name: 'rules',      moduleId: './rules/rules',         nav: true, title: 'Rules' },
      { route: 'features',    name: 'features',   moduleId: './features/features',   nav: true, title: 'Features' }
    ]);

    this.router = router;
  }
}
