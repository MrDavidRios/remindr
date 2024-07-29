import { Settings, createDefaultSettings } from './settings.js';

export default class User {
  name: string;

  email: string;

  settings: Settings;

  lastLogin: Date;

  constructor(name = '', email = '', settings = createDefaultSettings(), lastLogin = new Date()) {
    this.name = name;
    this.email = email;

    this.settings = settings;

    this.lastLogin = lastLogin;
  }

  getDefault(): User {
    this.name = 'Test Name';
    this.email = 'default@email.com';
    this.settings = createDefaultSettings();
    this.lastLogin = new Date();

    return this;
  }
}
