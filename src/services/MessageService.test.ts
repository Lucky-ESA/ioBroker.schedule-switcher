/// <reference types="mocha" />
import assert from "node:assert";
import { OnOffSchedule } from "../schedules/OnOffSchedule";
import { IoBrokerValidationState } from "./IoBrokerValidationState";
import { MessageService } from "./MessageService";

const dataId = "schedule-switcher.0.onoff.6.data";

/**
 * A message service with fakes of the adapter, the states and the serializer
 *
 * @param serialize what the serializer returns, or throws
 * @returns service, the answers, the saved states and how often a message was deferred
 */
function createService(serialize: () => string): {
    service: MessageService;
    answers: any[];
    saved: Record<string, any>;
    deferred: () => number;
} {
    const answers: any[] = [];
    let deferred = 0;
    const saved: Record<string, any> = {
        [dataId]: JSON.stringify({ type: "OnOffSchedule", name: "Old", triggers: [], active: true }),
    };
    const adapter: any = {
        log: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        sendTo: (_from: string, _command: string, message: any) => answers.push(message),
        setTimeout: () => {
            deferred++;
            return undefined;
        },
        setState: async () => {},
    };
    const stateService: any = {
        getState: (id: string) => Promise.resolve(saved[id]),
        setState: (id: string, val: any) => {
            saved[id] = val;
            return Promise.resolve();
        },
        extendObject: async () => {},
    };
    const schedule = Object.create(OnOffSchedule.prototype);
    schedule.setName = () => {};
    const service = new MessageService(
        stateService,
        new Map([[dataId, schedule]]),
        () => Promise.resolve({ serialize, getTriggerSerializer: serialize } as any),
        adapter,
        {} as any,
        undefined,
        () => ({}) as any,
        {},
    );
    return { service, answers, saved, deferred: () => deferred };
}

/**
 * @param command command
 * @param message parameters
 * @returns the message as onMessage gets it
 */
function msg(command: string, message: any): ioBroker.Message {
    return {
        command,
        message,
        from: "system.adapter.javascript.0",
        callback: { id: 1, ack: false, time: Date.now(), message },
    } as any;
}

describe("MessageService", () => {
    it("answers an error for change-name without name and handles the next message at once", async () => {
        const { service, answers, deferred } = createService(() => "{}");
        await service.handleMessage(msg("change-name", { dataId }));
        await service.handleMessage(msg("change-name", { dataId }));
        assert.deepStrictEqual(answers, [{ error: "The name cannot be null" }, { error: "The name cannot be null" }]);
        assert.strictEqual(deferred(), 0);
    });

    it("answers an error if a command throws and handles the next message at once", async () => {
        const { service, answers, deferred } = createService(() => {
            throw new Error("Id may not be null or undefined.");
        });
        const trigger = { type: "TimeTrigger", hour: 1, minute: 0, weekdays: [1], valueCheck: false, action: {} };
        await service.handleMessage(msg("update-trigger", { dataId, trigger }));
        await service.handleMessage(msg("change-name", { dataId }));
        assert.deepStrictEqual(answers, [
            { error: "Id may not be null or undefined." },
            { error: "The name cannot be null" },
        ]);
        assert.strictEqual(deferred(), 0);
    });

    it("answers an error for an unknown dataId", async () => {
        const { service, answers } = createService(() => "{}");
        await service.handleMessage(msg("enable-schedule", { dataId: "schedule-switcher.0.onoff.99.data" }));
        assert.deepStrictEqual(answers, [{ error: "No schedule found for state schedule-switcher.0.onoff.99.data" }]);
    });

    it("keeps active when a command saves the schedule", async () => {
        const { service, answers, saved } = createService(() =>
            JSON.stringify({ type: "OnOffSchedule", name: "New", triggers: [] }),
        );
        await service.handleMessage(msg("change-name", { dataId, name: "New" }));
        assert.deepStrictEqual(answers, []);
        assert.deepStrictEqual(JSON.parse(saved[dataId]), {
            type: "OnOffSchedule",
            name: "New",
            triggers: [],
            active: true,
        });
        await service.handleMessage(msg("change-active", { dataId, active: false }));
        assert.strictEqual(JSON.parse(saved[dataId]).active, false);
    });
});

describe("IoBrokerValidationState", () => {
    it("takes the objectId of a trigger from dataId if it is missing (update-trigger)", async () => {
        const adapter: any = { log: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} } };
        const validation = new IoBrokerValidationState(adapter, {} as any);
        const trigger: any = {
            type: "TimeTrigger",
            id: "0",
            hour: 12,
            minute: 32,
            weekdays: [1, 2, 3, 4, 5],
            valueCheck: false,
            action: { type: "OnOffStateAction", name: "On" },
        };
        await validation.validation(dataId, trigger, true);
        assert.strictEqual(trigger.objectId, 6);
    });
});
