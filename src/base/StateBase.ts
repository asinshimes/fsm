/* eslint-disable @typescript-eslint/no-empty-function */
namespace fsm {

    export class StateBase<TStateId>{
        public needsExitTimes: boolean;

        public name: TStateId;

        public fsm: IStateMachine<TStateId>;


        constructor(needsExitTime: boolean) {
            this.needsExitTimes = needsExitTime;
        }

        public init() {

        }

        public onEnter() {

        }

        public onLogic() {

        }

        public onExit() {

        }

        public requestExit() {

        }

    }


    export type SStateBase = StateBase<string>
}