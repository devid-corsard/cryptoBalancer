import Model from './components/Model.js';
import View from './components/View.js';
import Controller from './components/Controller.js';
import config from './components/config.js';

new Controller(new Model(), new View(config));
