import { Subject } from 'rxjs';
import { Event } from './account.events';

/**
 * A central event stream for the application using an RxJS Subject.
 * Handlers will push events to this stream, and listeners will subscribe to it.
 */
export const eventStream = new Subject<Event>();