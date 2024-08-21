import { SimplePool } from "nostr-tools";
import { fetchComments, fetchUserProfiles } from ".";
import { Event } from "nostr-tools/lib/types/core";

export class Throttler {
    private queue: string[] = [];
    private intervalId: NodeJS.Timeout | null = null;
    private limit: number;
    private pool: SimplePool;
    private callback: (events: Event[]) => void;
    private queueType: "profiles" | "comments"

    constructor(limit: number, pool: SimplePool, callback: (events: Event[]) => void, queueType: "profiles" | "comments") {
        this.limit = limit;
        this.pool = pool;
        this.callback = callback;
        this.queueType = queueType
    }

    public addId(pubkey: string) {
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
        let results: Event[] = []
        const IdsToProcess = this.queue.splice(0, this.limit);
        if (this.queueType === "profiles") {
            results = await fetchUserProfiles(IdsToProcess, this.pool);
        }
        if (this.queueType === "comments") {
            results = await fetchComments(IdsToProcess, this.pool);
        }

        this.callback(results)
    }
}