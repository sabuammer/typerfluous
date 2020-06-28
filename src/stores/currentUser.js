import { writable, readable, derived } from 'svelte-persistent-store/dist/local';

export const currentUser = writable("currentUser", null);
