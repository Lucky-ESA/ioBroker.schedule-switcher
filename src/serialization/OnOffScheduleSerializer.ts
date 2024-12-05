import type { Action } from "../actions/Action";
import { OnOffStateAction } from "../actions/OnOffStateAction";
import type { UniversalTriggerScheduler } from "../scheduler/UniversalTriggerScheduler";
import { OnOffSchedule } from "../schedules/OnOffSchedule";
import type { LoggingService } from "../services/LoggingService";
import type { Trigger } from "../triggers/Trigger";
import { ActionReferenceSerializer } from "./ActionReferenceSerializer";
import type { Serializer } from "./Serializer";
import type { UniversalSerializer } from "./UniversalSerializer";

/**
 * OnOffScheduleSerializer
 */
export class OnOffScheduleSerializer implements Serializer<OnOffSchedule> {
    /**
     * @param triggerScheduler Scheduler
     * @param actionSerializer Serializer
     * @param triggerSerializer Serializer
     * @param adapter ioBroker
     * @param loggingService Log Service
     */
    constructor(
        private triggerScheduler: UniversalTriggerScheduler,
        private actionSerializer: UniversalSerializer<Action>,
        private triggerSerializer: UniversalSerializer<Trigger>,
        private adapter: ioBroker.Adapter,
        private loggingService: LoggingService,
    ) {}

    /**
     * @param stringToDeserialize OnOffSchedule
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
     * @param schedule OnOffSchedule
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
     */
    getType(): string {
        return "OnOffSchedule";
    }

    /**
     * @param schedule OnOffSchedule
     */
    public getTriggerSerializer(schedule: OnOffSchedule): UniversalSerializer<Trigger> {
        if (schedule == null) {
            throw new Error("Schedule may not be null/undefined");
        }
        this.useActionReferenceSerializer(schedule);
        return this.triggerSerializer;
    }

    private useActionReferenceSerializer(schedule: OnOffSchedule): void {
        this.actionSerializer.useSerializer(
            new ActionReferenceSerializer(
                OnOffStateAction.prototype.constructor.name,
                new Map([
                    ["On", schedule.getOnAction()],
                    ["Off", schedule.getOffAction()],
                ]),
                this.adapter,
            ),
        );
    }
}
