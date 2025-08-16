import { eventStream } from '../events/event.stream';
import { filter } from 'rxjs/operators';
import {
    Event,
    ExecuteCommandEvent,
    ExecuteQueryEvent,
    CommandExecutedEvent,
    QueryExecutedEvent,
    GenericApplicationErrorEvent
} from '../events/account.events';

// A mapping of command/query classes to their respective handlers
const handlerMap = new Map<any, any>();

export class CommandQueryDispatcher {
    constructor() {
        // Subscribe to all command execution events
        eventStream.pipe(filter(event => event.eventName === 'ExecuteCommandEvent'))
            .subscribe(async (event) => {
                const typedEvent = event as ExecuteCommandEvent;
                const command = typedEvent.command;
                const commandName = command.constructor.name;
                const correlationId = typedEvent.correlationId;
                console.log(`[Dispatcher] Received command event: ${commandName} with correlationId: ${correlationId}`);

                const handler = handlerMap.get(command.constructor);
                if (handler) {
                    await handler.execute(command);
                    // Publish a confirmation event
                    eventStream.next(new CommandExecutedEvent(commandName, correlationId));
                } else {
                    eventStream.next(new GenericApplicationErrorEvent(
                        'CommandQueryDispatcher',
                        `No handler registered for command: ${commandName}`
                    ));
                }
            });

        // Subscribe to all query execution events
        eventStream.pipe(filter(event => event.eventName === 'ExecuteQueryEvent'))
            .subscribe(async (event) => {
                const typedEvent = event as ExecuteQueryEvent;
                const query = typedEvent.query;
                const queryName = query.constructor.name;
                const correlationId = typedEvent.correlationId;
                console.log(`[Dispatcher] Received query event: ${queryName} with correlationId: ${correlationId}`);

                const handler = handlerMap.get(query.constructor);
                if (handler) {
                    const result = await handler.execute(query);
                    // Publish the query result event
                    eventStream.next(new QueryExecutedEvent(queryName, correlationId, result));
                } else {
                    eventStream.next(new GenericApplicationErrorEvent(
                        'CommandQueryDispatcher',
                        `No handler registered for query: ${queryName}`
                    ));
                }
            });
    }

    public registerHandler(commandOrQuery: any, handler: any) {
        handlerMap.set(commandOrQuery, handler);
        console.log(`[Dispatcher] Registered handler for: ${commandOrQuery.name}`);
    }
}
