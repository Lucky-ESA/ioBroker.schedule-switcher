import { OnOffStateAction } from "../actions/OnOffStateAction";
import type { UniversalTriggerScheduler } from "../scheduler/UniversalTriggerScheduler";
import { OnOffSchedule } from "../schedules/OnOffSchedule";
import type { Action } from "../types/Action";
import type { LoggingService } from "../types/LoggingService";
import type { Serializer } from "../types/Serializer";
import type { Trigger } from "../types/Trigger";
import { ActionReferenceSerializer } from "./ActionReferenceSerializer";
import type { UniversalSerializer } from "./UniversalSerializer";

/**
 * OnOffScheduleSerializer
 */
export class OnOffScheduleSerializer implements Serializer<OnOffSchedule> {
    /**
     * @param triggerScheduler Scheduler
     * @param actionSerializer Serializer
     * @param triggerSerializer Serializer
     * @param loggingService Log Service
     */
    constructor(
        private triggerScheduler: UniversalTriggerScheduler,
        private actionSerializer: UniversalSerializer<Action>,
        private triggerSerializer: UniversalSerializer<Trigger>,
        private loggingService: LoggingService,
    ) {}

    /**
     * Deserialize
     *
     * @param stringToDeserialize OnOffSchedule
     * @returns schedule or crash adapter
     */
    deserialize(stringToDeserialize: string): OnOffSchedule {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        const onAction = this.actionSerializer.deserialize(JSON.stringify(json.onAction));
        const offAction = this.actionSerializer.deserialize(JSON.stringify(json.offAction));

        if (onAction instanceof OnOffStateAction && offAction instanceof OnOffStateAction) {
            const schedule = new OnOffSchedule(onAction, offAction, this.triggerScheduler, this.loggingService);
            schedule.setName(json.name);

            this.useActionReferenceSerializer(schedule);
            json.triggers.forEach((t: any) => {
                schedule.addTrigger(this.triggerSerializer.deserialize(JSON.stringify(t)));
            });

            return schedule;
        }
        throw new Error("Actions are not OnOffStateActions");
    }

    /**
     * Serialize
     *
     * @param schedule OnOffSchedule
     * @returns all action
     */
    serialize(schedule: OnOffSchedule): string {
        const json: any = {
            type: this.getType(),
            name: schedule.getName(),
            onAction: JSON.parse(this.actionSerializer.serialize(schedule.getOnAction())),
            offAction: JSON.parse(this.actionSerializer.serialize(schedule.getOffAction())),
        };
        this.useActionReferenceSerializer(schedule);
        json.triggers = schedule.getTriggers().map(t => JSON.parse(this.triggerSerializer.serialize(t)));
        return JSON.stringify(json);
    }

    /**
     * getType
     *
     * @returns action on/off
     */
    getType(): string {
        return "OnOffSchedule";
    }

    /**
     * getTriggerSerializer
     *
     * @param schedule OnOffSchedule
     * @returns trigger or crash adapter
     */
    public getTriggerSerializer(schedule: OnOffSchedule): UniversalSerializer<Trigger> {
        if (schedule == null) {
            throw new Error("Schedule may not be null/undefined");
        }
        this.useActionReferenceSerializer(schedule);
        return this.triggerSerializer;
    }

    /**
     * useActionReferenceSerializer
     *
     * @param schedule OnOffSchedule
     */
    private useActionReferenceSerializer(schedule: OnOffSchedule): void {
        this.actionSerializer.useSerializer(
            new ActionReferenceSerializer(
                OnOffStateAction.prototype.constructor.name,
                new Map([
                    ["On", schedule.getOnAction()],
                    ["Off", schedule.getOffAction()],
                ]),
                this.loggingService,
            ),
        );
    }
}
