namespace fsm {

    export type HyBridAction<TOwnId, TStateId, TEvent> = (arg: HybridStateMachine<TOwnId, TStateId, TEvent>) => any

    export class HybridStateMachine<TOwnId, TStateId, TEvent> extends StateMachine<TOwnId, TStateId, TEvent>{


        private timer: number;
        public constructor(
            private _enter: HyBridAction<TOwnId, TStateId, TEvent> = null,
            private _logic: HyBridAction<TOwnId, TStateId, TEvent> = null,
            private _exit: HyBridAction<TOwnId, TStateId, TEvent> = null,

            needsExitTimes = false,
        ) {
            super(needsExitTimes);
            this.timer = Date.now();
        }

        public onEnter(): void {
            super.onEnter();
            this.timer = Date.now();
            this._enter?.call(this, this);
        }

        public onLogic(): void {
            super.onLogic();
            this._logic.call(this, this);
        }

        public onExit(): void {
            super.onExit();
            this._logic.call(this, this);
        }
    }
}