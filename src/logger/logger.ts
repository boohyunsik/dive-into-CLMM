export class Logger {
    static log(tag: string, job: string, ...messages: any[]) {
        console.log(`[${tag}]`, `<${job}>`, ...messages);
    }
}