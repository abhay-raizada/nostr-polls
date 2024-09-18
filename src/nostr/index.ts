import {
  Event,
  EventTemplate,
  finalizeEvent,
  getEventHash,
  getPublicKey,
  SimplePool,
  UnsignedEvent,
  nip13,
} from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

export const defaultRelays = [
  "wss://relay.damus.io/",
  "wss://relay.primal.net/",
  "wss://nos.lol",
  "wss://relay.nostr.wirednet.jp/",
  "wss://nostr-01.yakihonne.com",
  "wss://relay.snort.social",
  "wss://relay.hllo.live",
  "wss://relay.nostr.band",
  "wss://nostr21.com",
  "wss://relay.mutinywallet.com",
];

export const fetchUserProfile = async (pubkey: string, pool: SimplePool) => {
  let result = await pool.get(defaultRelays, { kinds: [0], authors: [pubkey] });
  return result;
};

export const fetchUserProfiles = async (
  pubkeys: string[],
  pool: SimplePool
) => {
  let result = await pool.querySync(defaultRelays, {
    kinds: [0],
    authors: pubkeys,
  });
  return result;
};

export const fetchComments = async (eventIds: string[], pool: SimplePool) => {
  let result = await pool.querySync(defaultRelays, {
    kinds: [1],
    "#e": eventIds,
  });
  return result;
};

export const fetchLikes = async (eventIds: string[], pool: SimplePool) => {
  let result = await pool.querySync(defaultRelays, {
    kinds: [7],
    "#e": eventIds,
  });
  return result;
};

export const fetchZaps = async (eventIds: string[], pool: SimplePool) => {
  let result = await pool.querySync(defaultRelays, {
    kinds: [9735],
    "#e": eventIds,
  });
  return result;
};

export function openProfileTab(npub: `npub1${string}`) {
  let url = `https://njump.me/${npub}`;
  window?.open(url, "_blank")?.focus();
}

export const getATagFromEvent = (event: Event) => {
  let d_tag = event.tags.find((tag) => tag[0] === "d")?.[1];
  let a_tag = d_tag
    ? `${event.kind}:${event.pubkey}:${d_tag}`
    : `${event.kind}:${event.pubkey}:`;
  return a_tag;
};

export const findPubkey = async (secret?: string) => {
  let secretKey;
  let pubkey;
  if (secret) {
    secretKey = hexToBytes(secret);
    pubkey = getPublicKey(secretKey);
  } else {
    pubkey = await window.nostr?.getPublicKey();
  }
  return pubkey;
};

export const signEvent = async (event: EventTemplate, secret?: string) => {
  let signedEvent;
  let secretKey;
  if (secret) secretKey = hexToBytes(secret);
  if (secretKey) {
    signedEvent = finalizeEvent(event, secretKey);
  } else {
    signedEvent = await window.nostr?.signEvent(event);
  }
  return signedEvent;
};

export async function minePow(
  unsigned: UnsignedEvent,
  difficulty: number,
  tracker: MiningTracker
): Promise<Omit<Event, "sig">> {
  let count = 0;
  const yieldInterval = 100000000;

  const event = unsigned as Omit<Event, "sig">;
  const tag = ["nonce", count.toString(), difficulty.toString()];
  const queryTag = ["W", difficulty.toString()];

  event.tags.push(tag);
  event.tags.push(queryTag);

  while (true) {
    const now = Math.floor(new Date().getTime() / 1000);
    if (tracker.cancelled) {
      throw new Error("Operation cancelled");
    }

    if (now !== event.created_at) {
      count = 0;
      event.created_at = now;
    }

    tag[1] = (++count).toString();
    event.id = getEventHash(event);
    let currentDifficulty = nip13.getPow(event.id);
    if (currentDifficulty > tracker.maxDifficultySoFar) {
      tracker.maxDifficultySoFar = currentDifficulty;
    }
    if (nip13.getPow(event.id) >= difficulty) {
      break;
    }

    if (tracker.hashesComputed % yieldInterval === 0) {
      tracker.hashesComputed += yieldInterval;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return event;
}

export class MiningTracker {
  public cancelled: boolean;
  public maxDifficultySoFar: number;
  public hashesComputed: number;
  constructor() {
    this.cancelled = false;
    this.maxDifficultySoFar = 0;
    this.hashesComputed = 0;
  }

  cancel() {
    this.cancelled = true;
  }
}
