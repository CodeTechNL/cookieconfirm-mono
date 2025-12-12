// Polyfill Web Streams API for Jest's jsdom environment
// This addresses errors like: ReferenceError: TransformStream is not defined

// Use Node's implementation of the Web Streams API
try {
    const webStreams = require("node:stream/web");

    if (typeof (globalThis as any).TransformStream === "undefined" && webStreams.TransformStream) {
        (globalThis as any).TransformStream = webStreams.TransformStream;
    }

    // Optionally polyfill related streams for robustness
    if (typeof (globalThis as any).ReadableStream === "undefined" && webStreams.ReadableStream) {
        (globalThis as any).ReadableStream = webStreams.ReadableStream;
    }
    if (typeof (globalThis as any).WritableStream === "undefined" && webStreams.WritableStream) {
        (globalThis as any).WritableStream = webStreams.WritableStream;
    }
} catch (e) {
    // If node:stream/web is unavailable in this environment, ignore.
}
