// Types for browser APIs not (yet) in TypeScript's DOM library.

// File Handling API (installed PWA opened with files)
// https://developer.mozilla.org/docs/Web/API/LaunchQueue
interface LaunchParams {
  readonly files: ReadonlyArray<FileSystemFileHandle>;
  readonly targetURL?: string;
}

declare var LaunchParams: {
  prototype: LaunchParams;
};

interface LaunchQueue {
  setConsumer(consumer: (launchParams: LaunchParams) => void): void;
}

interface Window {
  readonly launchQueue?: LaunchQueue;
}

// iOS Safari: true when running as a home-screen web app
interface Navigator {
  readonly standalone?: boolean;
}
