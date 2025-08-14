# CQRS-BANK
# CQRS and Event Sourcing with TypeScript and RxJS


# Project Overview

The application simulates a simple banking system where you can perform deposits, withdrawals, and check account balances. The core design principles are:

- Commands: Actions that modify the state of the system (e.g., `WithdrawCommand`).

- Queries: Actions that read the state of the system without making any changes (e.g., `GetBalanceQuery`).

- Event Sourcing: Every state change is captured as a discrete event that is published to a central event stream.

- RxJS Event Stream: Instead of a traditional event bus, this project uses an RxJS `Subject` to create a reactive event stream. Handlers push events to the stream, and any number of subscribers can react to those events. This decouples the event producers from the consumers and allows for more complex, asynchronous event handling.

✨ **Features**

- **CQRS Architecture**: The application is structured to separate commands (write operations) from queries (read operations).  
- **Event Sourcing**: All changes to the state are captured as events, allowing for a complete audit trail.
- **Asynchronous Operations**: Handlers and services are designed to be asynchronous, simulating real-world scenarios.
- **Dependency Injection**: Dependencies are injected into handlers, promoting modularity and testability.
- **Unit Tests**: Comprehensive tests are included to ensure the correctness of command and query handlers.
- **Event Logging**: An event logger is included to demonstrate the flow of events through the system.
- **TypeScript**: The code is written in TypeScript, leveraging its type system for better maintainability and readability.
- **Node.js**: The application runs on Node.js, making it easy to set up and run locally.
- **Jest**: The project uses Jest for testing, providing a robust framework for unit tests.
- **ts-node**: Used for running TypeScript files directly without needing to compile them first.
- **Modular Structure**: The project is organized into commands, queries, services, events, and tests, making it easy to navigate and maintain.
- **Scalability**: The architecture allows for easy scaling of commands and queries independently.
- **Extensibility**: New commands, queries, and events can be easily added without affecting existing functionality.
- **Robust Error Handling**: The application includes error handling mechanisms to manage exceptions in commands and queries.



# How RxJS is Used
The `src/events/event.stream.ts` file exports a single, globally accessible `Subject<Event>`. This `Subject` acts as the central event hub.

Publishing Events: In the command handlers (`withdraw.handler.ts`), after a state change is successfully applied, an event is pushed to the stream using `eventStream.next(new MyEvent(...))`.

Subscribing to Events: The event listeners (`event.logger.ts, main.ts`) subscribe to this stream. They use RxJS operators like `filter()` to listen for specific event types. This allows for clean, declarative handling of events.

For example, the EventLogger only "hears" about the events it cares about:

```

// From src/events/event.logger.ts
eventStream.pipe(filter(event => event.eventName === 'MoneyWithdrawnEvent'))
    .subscribe(event => this.handleMoneyWithdrawn(event as MoneyWithdrawnEvent));

```

This pattern ensures that new event listeners can be added easily without modifying the existing command handlers, which is a key benefit of a reactive, decoupled architecture.

# Getting Started
This project is a TypeScript application that demonstrates the Command Query Responsibility Segregation (CQRS) pattern with Event Sourcing and Dependency Injection.

## 🛠️ Prerequisites

To run this project, you will need:
 - Node.js: `https://nodejs.org/`
 - npm: (Comes with `Node.js`)

🚀 Installation

Clone the repository (or copy the files provided in the conversation history).

- Navigate to the project directory.
- Install the project dependencies: `npm install`


## ▶️ Usage

**To Run the Application**

Execute the main file to see a demonstration of the commands and queries in action. The EventLogger will print messages for each event that is published.

`npm start`

To Run the Tests

To verify that all command and query handlers are working correctly, run the test suite:

`npm test`

## 📂 Project Structure

```
├── src/
│   ├── commands/             # All command definitions and their handlers
│   │   ├── withdraw.command.ts
│   │   └── withdraw.handler.ts
│   ├── queries/              # All query definitions and their handlers
│   │   ├── get-balance.query.ts
│   │   └── get-balance.handler.ts
│   ├── services/             # Core business logic and data access (simulated async operations)
│   │   └── account.service.ts
│   ├── events/               # Event definitions, the RxJS event stream, and event listeners
│   │   ├── account.events.ts
│   │   ├── event.stream.ts
│   │   └── event.logger.ts
│   ├── models/               # Data models and types
│   │   └── account.model.ts
│   ├── interfaces/             # Handler interfaces to enforce a consistent contract
│   │   └── handler.interface.ts
│   └── main.ts               # The main entry point to run the application
└── tests/                    # Unit tests for handlers
    └── ...

```