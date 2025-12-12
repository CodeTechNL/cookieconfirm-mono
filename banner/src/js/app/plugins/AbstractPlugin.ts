import { ConsentTypes } from "@/js/app/types";

export abstract class AbstractPlugin {
  onConsent(cb: (detail: ConsentTypes[]) => void): void {
    if (this.isDefined()) {
      window.ccListen("enableConsent", cb);
    }
  }

  abstract register(): void;

  abstract isDefined(): boolean;
}
