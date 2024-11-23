// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
    namespace ioBroker {
        interface AdapterConfig {
            switch_delay: number;
            usehtml: boolean;
            history: number;
            schedules: {
                onOff: [];
            };
            schedulesData: [
                {
                    stateId: number | null;
                    active: string | null;
                    count: string | null;
                    objectid: string | null;
                    objectname: string | null;
                },
            ];
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
