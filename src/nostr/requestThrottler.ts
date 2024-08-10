import { SimplePool } from "nostr-tools";
import { fetchUserProfiles } from ".";
import { Event } from "nostr-tools/lib/types/core";

export class Throttler {
    private queue: string[] = [];
    private intervalId: NodeJS.Timeout | null = null;
    private limit: number;
    private pool: SimplePool;
    private callback: (event: Event) => void;

    constructor(limit: number, pool: SimplePool, callback: (event: Event) => void) {
        this.limit = limit;
        this.pool = pool;
        this.callback = callback;
    }

    public add(pubkey: string) {
        if (!this.queue.includes(pubkey)) {
            this.queue.push(pubkey);
            this.startProcessing();
        }
    }

    private startProcessing() {
        if (this.intervalId) return; // Already processing

        this.intervalId = setInterval(() => {
            this.processQueue();
        }, 1000); // Process every second
    }

    private async processQueue() {
        if (this.queue.length === 0) {
            clearInterval(this.intervalId!);
            this.intervalId = null;
            return;
        }
        const pubkeysToProcess = this.queue.splice(0, this.limit);
        const results = await fetchUserProfiles(pubkeysToProcess, this.pool);
        results.forEach((result: Event) => {
            this.callback(result)
        })
    }
}