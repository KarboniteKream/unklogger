/**
 * Log message context.
 *
 * Includes base properties as well as user-defined extension functions.
 */
export type Context = {
    /**
     * Message timestamp, in `YYYY-MM-DD HH:mm:ss` format.
     */
    $timestamp: string;

    /**
     * List of message tags.
     */
    $tags: any[];

    /**
     * Message text.
     */
    $message: string;

    /**
     * Full log output. Includes the timestamp, tags, and message.
     */
    $output: string;

    /**
     * List of arguments passed to the log function.
     */
    $arguments: any[];
} & Record<string, (...args: any[]) => Context>;

/**
 * Console configuration.
 */
export interface Console {
    /**
     * Output stream for the `log` level.
     * Equivalent to `console.log()`.
     */
    log(message?: any, ...optionalParams: any[]): void;

    /**
     * Output stream for the `info` level.
     * Equivalent to `console.info()`.
     */
    info(message?: any, ...optionalParams: any[]): void;

    /**
     * Output stream for the `warn` level.
     * Equivalent to `console.warn()`.
     */
    warn(message?: any, ...optionalParams: any[]): void;

    /**
     * Output stream for the `error` level.
     * Equivalent to `console.error()`.
     */
    error(message?: any, ...optionalParams: any[]): void;
}

/**
 * Unklogger configuration.
 */
export interface Configuration {
    /**
     * Whether the output should be suppressed.
     */
    quiet: boolean;

    /**
     * Whether the colors are enabled.
     */
    colors: boolean;

    /**
     * Console stream configuration.
     */
    console: Console,
}

/**
 * Unklogger instance.
 */
export interface Unklogger {
    /**
     * Instance configuration.
     */
    $config: Configuration;

    /**
     * Creates a new instance.
     *
     * @returns A new {@link Unklogger} instance.
     */
    new(): Unklogger;

    /**
     * Clones the existing instance, preserving configuration.
     *
     * @returns A new {@link Unklogger} instance.
     */
    clone(): Unklogger;

    /**
     * Logs the specified messages on the `log` level.
     *
     * @param messages - List of objects to log.
     *
     * @returns The message {@link Context}.
     */
    log(...messages: any[]): Context;

    /**
     * Logs the specified messages on the `info` level.
     *
     * @param messages - List of objects to log.
     *
     * @returns The message {@link Context}.
     */
    info(...messages: any[]): Context;

    /**
     * Logs the specified messages on the `log` level.
     * Defaults to green text.
     *
     * @param messages - List of objects to log.
     *
     * @returns The message {@link Context}.
     */
    success(...messages: any[]): Context;

    /**
     * Logs the specified messages on the `warn` level.
     * Defaults to yellow text.
     *
     * @param messages - List of objects to log.
     *
     * @returns The message {@link Context}.
     */
    warn(...messages: any[]): Context;

    /**
     * Logs the specified messages on the `error` level.
     * Defaults to red text.
     *
     * @param messages - List of objects to log.
     *
     * @returns The message {@link Context}.
     */
    error(...messages: any[]): Context;

    /**
     * Registers a hook to execute at the specified `event`.
     *
     * @param event - Event name.
     * @param fn - Function to execute.
     *
     * @returns The current {@link Unklogger} instance.
     */
    addHook(
        event: string,
        fn: (context: Context) => void
    ): Unklogger;

    /**
     * Registers an extension with the specified `name`.
     * Extension will be available on {@link Context} and can be called with `args`.
     *
     * @param name - Extension name.
     * @param fn - Function to register.
     *
     * @returns The current {@link Unklogger} instance.
     */
    addExtension(
        name: string,
        fn: (context: Context, ...args: any[]) => void
    ): Unklogger;
}

declare const unklogger: Unklogger;
export default unklogger;
