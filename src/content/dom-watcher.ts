/**
 * One MutationObserver for every feature.
 *
 * YouTube's pages mutate constantly (hundreds of nodes per scroll). Each feature running its own
 * observer and querySelectorAll would multiply that cost, so features subscribe here instead:
 * mutations are collected and handled once per animation frame, only added elements are looked at,
 * and the observer is disconnected while nobody is subscribed.
 */

type Callback = (elements: Element[]) => void;

interface Subscription {
  readonly selector: string;
  readonly callback: Callback;
}

export class DomWatcher {
  private readonly subscriptions = new Set<Subscription>();
  private readonly pending: Element[] = [];
  private observer: MutationObserver | null = null;
  private frameRequested = false;

  /**
   * Calls back with every element matching the selector: the ones already in the page right away,
   * then new ones as YouTube adds them (batched per frame). Returns an unsubscribe function.
   */
  watch(selector: string, callback: Callback): () => void {
    const subscription: Subscription = { selector, callback };
    this.subscriptions.add(subscription);
    this.connect();

    const existing = document.querySelectorAll(selector);
    if (existing.length > 0) {
      callback(Array.from(existing));
    }

    return () => {
      this.subscriptions.delete(subscription);
      if (this.subscriptions.size === 0) {
        this.disconnect();
      }
    };
  }

  private connect(): void {
    if (this.observer !== null) {
      return;
    }

    this.observer = new MutationObserver((records) => this.collect(records));
    this.observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.pending.length = 0;
  }

  private collect(records: MutationRecord[]): void {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.pending.push(node as Element);
        }
      }
    }

    if (this.pending.length > 0 && !this.frameRequested) {
      this.frameRequested = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  private flush(): void {
    this.frameRequested = false;
    const added = this.pending.splice(0, this.pending.length);
    for (const subscription of this.subscriptions) {
      const matches: Element[] = [];
      for (const element of added) {
        if (!element.isConnected) {
          continue;
        }

        if (element.matches(subscription.selector)) {
          matches.push(element);
        }

        // Descendants of an added subtree are not reported separately, so look inside it.
        if (element.firstElementChild !== null) {
          for (const inner of element.querySelectorAll(subscription.selector)) {
            matches.push(inner);
          }
        }
      }

      if (matches.length > 0) {
        subscription.callback(matches);
      }
    }
  }
}
