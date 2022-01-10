namespace fsm {

    export type CanExitFunc<TStateId> = (arg: State<TStateId>) => boolean;

    export class State<TStateId> extends StateBase<TStateId>{
        public timer: number;

        public constructor(
            private _onEnter: StateAction<State<TStateId>> = null,
            private _onLogic: StateAction<State<TStateId>> = null,
            private _onExit: StateAction<State<TStateId>> = null,
            private _canExit: CanExitFunc<TStateId> = null,
            needsExitTime = true) {
            super(needsExitTime);
        }

        public init() {
            this.timer = Date.now();
        }

        public onEnter() {
            this.timer = Date.now();
            this._onEnter?.call(this, this);
        }

        public onLogic() {
            this._onLogic?.call(this, this);
        }
        public onExit() {
            this._onExit?.call(this, this);
        }

        public requestExit() {
            if (!this.needsExitTimes || this._canExit?.call(this, this)) {
                this.fsm.stateCanExit();
            }
        }
    }
}