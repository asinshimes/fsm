namespace fsm {
    export type StateAction<T> = (arg: T) => any

    export type SStateWrapper = StateWrapper<string, string>

    export class StateWrapper<TStateId, TEvent>{
        public constructor
            (private beforeOnEnter: StateAction<StateBase<TStateId>> = null,
                private afterOnEnter: StateAction<StateBase<TStateId>> = null,
                private beforeOnLogic: StateAction<StateBase<TStateId>> = null,
                private afterOnLogic: StateAction<StateBase<TStateId>> = null,
                private beforeOnExit: StateAction<StateBase<TStateId>> = null,
                private afterOnExit: StateAction<StateBase<TStateId>> = null) {

        }

        public warp(state: StateBase<TStateId>): WrappedState<TStateId, TEvent> {
            return new WrappedState(
                state,
                this.beforeOnEnter,
                this.afterOnEnter,
                this.beforeOnLogic,
                this.afterOnLogic,
                this.beforeOnExit,
                this.afterOnExit
            );
        }

    }

    class WrappedState<TStateId, TEvent> extends StateBase<TStateId> implements ITriggerable<TEvent>{



        public constructor(
            private state: StateBase<TStateId>,
            private beforeOnEnter: StateAction<StateBase<TStateId>> = null,
            private afterOnEnter: StateAction<StateBase<TStateId>> = null,
            private beforeOnLogic: StateAction<StateBase<TStateId>> = null,
            private afterOnLogic: StateAction<StateBase<TStateId>> = null,
            private beforeOnExit: StateAction<StateBase<TStateId>> = null,
            private afterOnExit: StateAction<StateBase<TStateId>> = null
        ) {
            super(state.needsExitTimes);
        }

        public init() {
            const { state, name, fsm } = this;
            state.name = name;
            state.fsm = fsm;
            state.init();
        }

        public onEnter() {
            this.beforeOnEnter?.call(this, this);
            this.state.onEnter();
            this.afterOnEnter?.call(this, this);
        }

        public onLogic() {
            this.beforeOnLogic?.call(this, this);
            this.state.onLogic();
            this.afterOnLogic?.call(this, this);
        }

        public onExit() {
            this.beforeOnExit?.call(this, this);
            this.state.onExit();
            this.afterOnExit?.call(this, this);
        }

        public requestExit() {
            this.state.requestExit();
        }

        trigger(trigger: TEvent) {
            const state: any = this.state;
            if (state.trigger) {
                state.trigger.call(state, trigger);
            }
        }

    }
}