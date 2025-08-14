export interface ICommandHandler<TCommand> {
    execute(command: TCommand): Promise<void>;
}

export interface IQueryHandler<TQuery, TResult> {
    execute(query: TQuery): Promise<TResult>;
}