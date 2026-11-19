/// <reference types="mocha" />
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { COMMANDS, HELP } from "./help";

/**
 * The commands, that onMessage in src/main.ts answers or handles
 *
 * @returns command names
 */
function commandsOfMain(): string[] {
    const source = readFileSync(join(__dirname, "../main.ts"), "utf8");
    const start = source.indexOf("private async onMessage(");
    const end = source.indexOf("private async updateHTML(");
    assert.ok(start > 0 && end > start, "onMessage found");
    const part = source.slice(start, end);
    return [
        ...[...part.matchAll(/case "([^"]+)":/g)].map(m => m[1]),
        ...[...part.matchAll(/obj\??\.command === "([^"]+)"/g)].map(m => m[1]),
    ];
}

describe("message help", () => {
    it("lists exactly the commands onMessage handles, each once", () => {
        const names = COMMANDS.map(c => c.command);
        assert.strictEqual(new Set(names).size, names.length);
        assert.deepStrictEqual([...names].sort(), [...new Set(commandsOfMain())].sort());
    });

    it("marks only the commands that just read as read-only", () => {
        const readOnly = ["help", "getActiv", "getCountSchedule", "getNameSchedule", "getIdNameSchedule"];
        for (const { command, write } of COMMANDS) {
            assert.strictEqual(write, !readOnly.includes(command), command);
        }
    });

    it("names every command", () => {
        for (const { command } of COMMANDS.filter(c => c.command !== "help")) {
            assert.ok(HELP.includes(command), command);
        }
        for (const word of ["sendTo schedule-switcher.0", "How to talk to the user", "onoff.<n>.enabled"]) {
            assert.ok(HELP.includes(word), word);
        }
    });

    it("keeps the lines short", () => {
        for (const line of HELP.split("\n")) {
            assert.ok(line.length <= 120, line);
        }
    });
});
