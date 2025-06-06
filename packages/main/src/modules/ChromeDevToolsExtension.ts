import { session as electronSession } from "electron";
import installer from "electron-devtools-installer";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";

const {
  REDUX_DEVTOOLS,
  VUEJS_DEVTOOLS,
  EMBER_INSPECTOR,
  BACKBONE_DEBUGGER,
  REACT_DEVELOPER_TOOLS,
  JQUERY_DEBUGGER,
  MOBX_DEVTOOLS,
  default: installExtension,
} = installer;

const extensionsDictionary = {
  REDUX_DEVTOOLS,
  VUEJS_DEVTOOLS,
  EMBER_INSPECTOR,
  BACKBONE_DEBUGGER,
  REACT_DEVELOPER_TOOLS,
  JQUERY_DEBUGGER,
  MOBX_DEVTOOLS,
} as const;

// Workaround from https://github.com/electron/electron/issues/41613#issuecomment-2644018998
function launchExtensionBackgroundWorkers(
  session = electronSession.defaultSession
) {
  return Promise.all(
    session.extensions.getAllExtensions().map(async (extension) => {
      const manifest = extension.manifest;
      if (
        manifest.manifest_version === 3 &&
        manifest?.background?.service_worker
      ) {
        await session.serviceWorkers.startWorkerForScope(extension.url);
      }
    })
  );
}

export class ChromeDevToolsExtension implements AppModule {
  readonly #extension: keyof typeof extensionsDictionary;

  constructor({
    extension,
  }: {
    readonly extension: keyof typeof extensionsDictionary;
  }) {
    this.#extension = extension;
  }

  async enable({ app }: ModuleContext): Promise<void> {
    await app.whenReady();
    await installExtension(extensionsDictionary[this.#extension]);
    await launchExtensionBackgroundWorkers();
  }
}

export function chromeDevToolsExtension(
  ...args: ConstructorParameters<typeof ChromeDevToolsExtension>
) {
  return new ChromeDevToolsExtension(...args);
}
