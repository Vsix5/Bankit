import { AsyncLocalStorage } from 'async_hooks';

export const dbContext = new AsyncLocalStorage()