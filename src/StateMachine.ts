namespace fsm {

    export class StateMachine<TOwnId, TStateId, TEvent> extends StateBase<TOwnId> implements ITriggerable<TEvent>, IStateMachine<TStateId>{


        private static readonly noTranstions: [] = [];

        private static readonly noTriggerTranstions = new Map();

        private startState = { hasState: false, state: null };
        private pendingState = { isPending: false, state: null };


        private nameToStateBundle: Map<TStateId, StateBundle<TStateId, TEvent>> = new Map();

        private _activeState: StateBase<TStateId> = null;
        private activeTransitions: TransitionBase<TStateId>[] = StateMachine.noTranstions;
        private activeTriggerTransitions: Map<TEvent, TransitionBase<TStateId>[]> = StateMachine.noTriggerTranstions;

        private transitionsFromAny: TransitionBase<TStateId>[] = [];
        private triggerTransitionsFromAny: Map<TEvent, TransitionBase<TStateId>[]> = new Map();

        public constructor(needsExitTimes = true) {
            super(needsExitTimes);
        }

        private get activeStateName(): TStateId {
            return this.activeState.name;
        }

        private get isRootFsm(): boolean {
            return !this.fsm;
        }

        public get activeState() {
            if (!this._activeState) {
                throw new exceptions.StateMachineNotInitializedException('Trying to get the active state');
            }
            return this._activeState;
        }

        public stateCanExit() {
            const { pendingState } = this;
            if (pendingState.isPending) {
                this.changeState(pendingState.state);
                pendingState.state = false;
            }
            this.fsm?.stateCanExit();
        }

        public requestExit() {
            if (this.activeState.needsExitTimes) {
                this.activeState.requestExit();
                return;
            }
            this.fsm?.stateCanExit();
        }

        public requestStateChange(name: TStateId, forceInstantly: boolean) {
            if (!this.activeState.needsExitTimes || forceInstantly) {
                this.changeState(name);
            } else {
                this.pendingState.state = name;
                this.pendingState.isPending = true;
                this.activeState.requestExit();
            }
        }

        public setStartState(name: TStateId) {
            this.startState.state = name;
            this.startState.hasState = true;
        }

        public init() {
            if (!this.isRootFsm) {
                return;
            }
            this.onEnter();
        }

        public onEnter() {
            if (!this.startState.hasState) {
                throw new Error(
                    exceptions.ExceptionFormatter.format(
                        'Running OnEnter of the state machine.',
                        `No start state is selected. 
                        'The state machine needs at least one state to function properly.`,
                        `Make sure that there is at least one state in the state machine 
                         before running Init() or OnEnter() by calling fsm.AddState(...).`
                    )
                );
            }

            this.changeState(this.startState.state);
            this.transitionsFromAny.forEach((value) => {
                value.onEnter();
            });
            this.triggerTransitionsFromAny.forEach((transtions) => {
                transtions.forEach((value) => {
                    value.onEnter();
                });
            });
        }

        public onLogic() {
            if (!this.activeState) {
                throw new exceptions.StateMachineNotInitializedException('running onlogic');
            }
            const { transitionsFromAny, activeTransitions } = this;
            let length = transitionsFromAny.length;
            for (let i = 0; i < length; i++) {
                const transition = transitionsFromAny[i];
                if (transition.to == this.activeState.name) {
                    continue;
                }
                if (this.tryTransition(transition)) {
                    break;
                }
            }
            length = activeTransitions.length;
            for (let i = 0; i < length; i++) {
                const transition = activeTransitions[i];

                if (this.tryTransition(transition)) {
                    break;
                }
            }


            this.activeState.onLogic();

        }

        public onExit() {
            if (this.activeState) {
                this.activeState.onExit();
                this._activeState = null;
            }
        }

        public addState(name: TStateId, state: StateBase<TStateId>);
        public addState(
            name: TStateId,
            onEnter?: StateAction<State<TStateId>>,
            onLogic?: StateAction<State<TStateId>>,
            onExit?: StateAction<State<TStateId>>,
            canExit?: CanExitFunc<TStateId>,
            needsExitTime?: boolean,
        )
        public addState(name: TStateId,
            state: StateBase<TStateId> | StateAction<State<TStateId>> | undefined,
            onLogic?: StateAction<State<TStateId>>,
            onExit?: StateAction<State<TStateId>>,
            canExit?: CanExitFunc<TStateId>,
            needsExitTime?: boolean,) {

            if (state instanceof StateBase) {
                state.fsm = this;
                state.name = name;
                state.init();
                const bundle = this.getOrCreateStateBundle(name);
                bundle.state = state;
                if (this.nameToStateBundle.size === 1 && !this.startState.hasState) {
                    this.setStartState(name);
                }
            } else {
                if (!state && !onLogic && !onExit && !canExit) {
                    this.addState(name, new StateBase<TStateId>(needsExitTime));
                    return;
                }
                this.addState(name, new State<TStateId>(state, onLogic, onExit, canExit, needsExitTime));
            }

        }


        public addTransition(transition: TransitionBase<TStateId>);
        public addTransition(
            from: TStateId,
            to: TStateId,
            condition?: TransitionCondition<TStateId>,
            forceInstantly?: boolean)


        public addTransition(
            transition: TransitionBase<TStateId> | TStateId,
            to?: TStateId,
            condition: TransitionCondition<TStateId> = null,
            forceInstantly = false) {
            if (transition instanceof TransitionBase) {
                this.initTransition(transition);
                const bundle = this.getOrCreateStateBundle(transition.from);
                bundle.addTransition(transition);
            } else {
                this.addTransition(this.createOptimizedTransition(null, to, condition, forceInstantly));
            }

        }

        public addTransitionFromAny(transition: TransitionBase<TStateId>);
        public addTransitionFromAny(to: TStateId, condition?: TransitionCondition<TStateId>, forceInstantly?: boolean)

        public addTransitionFromAny(transition: TransitionBase<TStateId> | TStateId, condition: TransitionCondition<TStateId> = null, forceInstantly = false) {
            if (transition instanceof TransitionBase) {
                this.initTransition(transition);
                this.transitionsFromAny.push(transition);
            } else {
                this.addTransitionFromAny(this.createOptimizedTransition(null, transition, condition, forceInstantly));
            }

        }

        public addTriggerTransition(trigger: TEvent, transition: TransitionBase<TStateId>);

        public addTriggerTransition(trigger: TEvent, from: TStateId, to: TStateId, condition?: TransitionCondition<TStateId>, forceInstantly?: boolean);



        public addTriggerTransition(trigger: TEvent, transition: TransitionBase<TStateId> | TStateId, to?: TStateId, condition?: TransitionCondition<TStateId>, forceInstantly?: boolean) {
            if (transition instanceof TransitionBase) {
                this.initTransition(transition);
                const bundle = this.getOrCreateStateBundle(transition.from);
                bundle.addTriggerTranstion(trigger, transition);
                return;
            }
            this.addTriggerTransition(trigger, this.createOptimizedTransition(transition, to, condition, forceInstantly));

        }

        public trigger(trigger: TEvent) {
            if (this.tryTrigger(trigger)) {
                return;
            }
            const state: any = this.activeState;
            if (state.trigger) {
                state.trigger(trigger);
            }
        }

        public triggerLocally(trigger: TEvent) {
            this.tryTrigger(trigger);
        }

        public getState(name: TStateId): StateBase<TStateId> {
            const bundle = this.nameToStateBundle.get(name);
            if (!bundle || !bundle.state) {
                throw new exceptions.StateNotFoundException<TStateId>(name, 'Getting a state');
            }
            return bundle.state;
        }

        public get(name: TStateId): StateMachine<string, string, string> {
            const state = this.getState(name);
            if (state instanceof StateMachine) {
                return state;
            }
            throw new Error(
                exceptions.ExceptionFormatter.format(
                    'Getting a nested state machine with the indexer',
                    'The selected state is not a state machine.',
                    `This method is only there for quickly accessing a nested state machine.
                    To get the selected state, use GetState(${name}).`
                )
            );
        }



        private changeState(name: TStateId) {
            this.activeState?.onExit();
            const bundle: StateBundle<TStateId, TEvent> = this.nameToStateBundle.get(name);
            if (!bundle || !bundle.state) {
                throw new exceptions.StateNotFoundException(name, 'Switching states');
            }
            this.activeTransitions = bundle.transitions ?? StateMachine.noTranstions;
            this.activeTriggerTransitions = bundle.triggerToTransitions ?? StateMachine.noTriggerTranstions;

            this._activeState = bundle.state;
            this.activeState.onEnter();

            this.activeTransitions.forEach((value) => {
                value.onEnter();
            });

            this.activeTriggerTransitions.forEach((transtions) => {
                transtions.forEach((value) => {
                    value.onEnter();
                });
            });
        }

        private tryTransition(transition: TransitionBase<TStateId>) {
            if (!transition.shouldTransition()) {
                return false;
            }
            this.requestStateChange(transition.to, transition.forceInstantly);
            return true;
        }

        private getOrCreateStateBundle(name: TStateId) {
            let bundle = this.nameToStateBundle.get(name);
            if (!bundle) {
                bundle = new StateBundle();
                this.nameToStateBundle.set(name, bundle);
            }
            return bundle;
        }

        private initTransition(transition: TransitionBase<TStateId>) {
            transition.fsm = this;
            transition.init();
        }

        private tryTrigger(trigger: TEvent) {
            if (!this.activeState) {
                throw new exceptions.StateMachineNotInitializedException(
                    'Checking all trigger transitions of the active state'
                );
            }

            let triggerTransitions = this.triggerTransitionsFromAny.get(trigger);
            if (triggerTransitions) {
                const length = triggerTransitions.length;
                for (let i = 0; i < length; i++) {
                    const transition = triggerTransitions[i];
                    if (transition.to == this.activeState.name) {
                        continue;
                    }
                    if (this.tryTransition(transition)) {
                        return true;
                    }
                }
            }
            triggerTransitions = this.activeTriggerTransitions.get(trigger);
            if (triggerTransitions) {
                const length = triggerTransitions.length;
                for (let i = 0; i < length; i++) {
                    const transition = triggerTransitions[i];

                    if (this.tryTransition(transition)) {
                        return true;
                    }
                }
            }
            return false;
        }

        private createOptimizedTransition(
            from: TStateId,
            to: TStateId,
            condition: TransitionCondition<TStateId> = null,
            forceInstantly = false): TransitionBase<TStateId> {
            if (condition == null)
                return new TransitionBase<TStateId>(from, to, forceInstantly);

            return new Transition<TStateId>(from, to, condition, forceInstantly);
        }







    }


    class StateBundle<TStateId, TEvent>{

        public state: StateBase<TStateId>;

        public transitions: TransitionBase<TStateId>[];

        public triggerToTransitions: Map<TEvent, TransitionBase<TStateId>[]>;


        public addTransition(t: TransitionBase<TStateId>) {
            if (!this.transitions) {
                this.transitions = [];
            }
            this.transitions.push(t);
        }

        public addTriggerTranstion(trigger: TEvent, transtion: TransitionBase<TStateId>) {
            if (!this.triggerToTransitions) {
                this.triggerToTransitions = new Map();
            }
            if (!this.triggerToTransitions.has(trigger)) {
                this.triggerToTransitions.set(trigger, []);
            }
            this.triggerToTransitions.get(trigger).push(transtion);

        }
    }
}