declare namespace fsm {
    class StateBase<TStateId> {
        needsExitTimes: boolean;
        name: TStateId;
        fsm: IStateMachine<TStateId>;
        constructor(needsExitTime: boolean);
        init(): void;
        onEnter(): void;
        onLogic(): void;
        onExit(): void;
        requestExit(): void;
    }
    type SStateBase = StateBase<string>;
}
declare namespace fsm {
    class StateMachine<TOwnId, TStateId, TEvent> extends StateBase<TOwnId> implements ITriggerable<TEvent>, IStateMachine<TStateId> {
        private static readonly noTranstions;
        private static readonly noTriggerTranstions;
        private startState;
        private pendingState;
        private nameToStateBundle;
        private _activeState;
        private activeTransitions;
        private activeTriggerTransitions;
        private transitionsFromAny;
        private triggerTransitionsFromAny;
        constructor(needsExitTimes?: boolean);
        private get activeStateName();
        private get isRootFsm();
        get activeState(): StateBase<TStateId>;
        stateCanExit(): void;
        requestExit(): void;
        requestStateChange(name: TStateId, forceInstantly: boolean): void;
        setStartState(name: TStateId): void;
        init(): void;
        onEnter(): void;
        onLogic(): void;
        onExit(): void;
        addState(name: TStateId, state: StateBase<TStateId>): any;
        addState(name: TStateId, onEnter?: StateAction<State<TStateId>>, onLogic?: StateAction<State<TStateId>>, onExit?: StateAction<State<TStateId>>, canExit?: CanExitFunc<TStateId>, needsExitTime?: boolean): any;
        addTransition(transition: TransitionBase<TStateId>): any;
        addTransition(from: TStateId, to: TStateId, condition?: TransitionCondition<TStateId>, forceInstantly?: boolean): any;
        addTransitionFromAny(transition: TransitionBase<TStateId>): any;
        addTransitionFromAny(to: TStateId, condition?: TransitionCondition<TStateId>, forceInstantly?: boolean): any;
        addTriggerTransition(trigger: TEvent, transition: TransitionBase<TStateId>): any;
        addTriggerTransition(trigger: TEvent, from: TStateId, to: TStateId, condition?: TransitionCondition<TStateId>, forceInstantly?: boolean): any;
        trigger(trigger: TEvent): void;
        triggerLocally(trigger: TEvent): void;
        getState(name: TStateId): StateBase<TStateId>;
        get(name: TStateId): StateMachine<string, string, string>;
        private changeState;
        private tryTransition;
        private getOrCreateStateBundle;
        private initTransition;
        private tryTrigger;
        private createOptimizedTransition;
    }
}
declare namespace fsm {
    class TransitionBase<TStateId> {
        from: TStateId;
        to: TStateId;
        forceInstantly: boolean;
        fsm: IStateMachine<TStateId>;
        constructor(from: TStateId, to: TStateId, forceInstantly?: boolean);
        init(): void;
        onEnter(): void;
        shouldTransition(): boolean;
    }
    type STransitionBase = TransitionBase<string>;
}
declare namespace fsm {
    type HyBridAction<TOwnId, TStateId, TEvent> = (arg: HybridStateMachine<TOwnId, TStateId, TEvent>) => any;
    class HybridStateMachine<TOwnId, TStateId, TEvent> extends StateMachine<TOwnId, TStateId, TEvent> {
        private _enter;
        private _logic;
        private _exit;
        private timer;
        constructor(_enter?: HyBridAction<TOwnId, TStateId, TEvent>, _logic?: HyBridAction<TOwnId, TStateId, TEvent>, _exit?: HyBridAction<TOwnId, TStateId, TEvent>, needsExitTimes?: boolean);
        onEnter(): void;
        onLogic(): void;
        onExit(): void;
    }
}
declare namespace fsm {
    type CanExitFunc<TStateId> = (arg: State<TStateId>) => boolean;
    class State<TStateId> extends StateBase<TStateId> {
        private _onEnter;
        private _onLogic;
        private _onExit;
        private _canExit;
        timer: number;
        constructor(_onEnter?: StateAction<State<TStateId>>, _onLogic?: StateAction<State<TStateId>>, _onExit?: StateAction<State<TStateId>>, _canExit?: CanExitFunc<TStateId>, needsExitTime?: boolean);
        init(): void;
        onEnter(): void;
        onLogic(): void;
        onExit(): void;
        requestExit(): void;
    }
}
declare namespace fsm {
    export type StateAction<T> = (arg: T) => any;
    export type SStateWrapper = StateWrapper<string, string>;
    export class StateWrapper<TStateId, TEvent> {
        private beforeOnEnter;
        private afterOnEnter;
        private beforeOnLogic;
        private afterOnLogic;
        private beforeOnExit;
        private afterOnExit;
        constructor(beforeOnEnter?: StateAction<StateBase<TStateId>>, afterOnEnter?: StateAction<StateBase<TStateId>>, beforeOnLogic?: StateAction<StateBase<TStateId>>, afterOnLogic?: StateAction<StateBase<TStateId>>, beforeOnExit?: StateAction<StateBase<TStateId>>, afterOnExit?: StateAction<StateBase<TStateId>>);
        warp(state: StateBase<TStateId>): WrappedState<TStateId, TEvent>;
    }
    class WrappedState<TStateId, TEvent> extends StateBase<TStateId> implements ITriggerable<TEvent> {
        private state;
        private beforeOnEnter;
        private afterOnEnter;
        private beforeOnLogic;
        private afterOnLogic;
        private beforeOnExit;
        private afterOnExit;
        constructor(state: StateBase<TStateId>, beforeOnEnter?: StateAction<StateBase<TStateId>>, afterOnEnter?: StateAction<StateBase<TStateId>>, beforeOnLogic?: StateAction<StateBase<TStateId>>, afterOnLogic?: StateAction<StateBase<TStateId>>, beforeOnExit?: StateAction<StateBase<TStateId>>, afterOnExit?: StateAction<StateBase<TStateId>>);
        init(): void;
        onEnter(): void;
        onLogic(): void;
        onExit(): void;
        requestExit(): void;
        trigger(trigger: TEvent): void;
    }
    export {};
}
declare namespace fsm {
    type TransitionCondition<TStateId> = (args: Transition<TStateId>) => boolean;
    class Transition<TStateId> extends TransitionBase<TStateId> {
        condition: TransitionCondition<TStateId>;
        constructor(from: TStateId, to: TStateId, condition?: TransitionCondition<TStateId>, forceInstantly?: boolean);
        shouldTransition(): boolean;
    }
    type STransition = Transition<string>;
}
declare namespace fsm {
    type AfterTransCondition<TStateId> = (args: TransitionAfter<TStateId>) => boolean;
    abstract class TransitionAfter<TStateId> extends TransitionBase<TStateId> {
        delay: number;
        condition: AfterTransCondition<TStateId>;
        timer: number;
        constructor(from: TStateId, to: TStateId, delay: number, condition?: AfterTransCondition<TStateId>, forceInstantly?: boolean);
        onEnter(): void;
        shouldTransition(): boolean;
    }
    type STransitionAfter = TransitionAfter<string>;
}
declare namespace fsm {
    type TransAfterDynamicCondition<TStateId, TRet> = (args: TransitionAfterDynamic<TStateId>) => TRet;
    abstract class TransitionAfterDynamic<TStateId> extends TransitionBase<TStateId> {
        delay: TransAfterDynamicCondition<TStateId, number>;
        condition: TransAfterDynamicCondition<TStateId, boolean>;
        timer: number;
        constructor(from: TStateId, to: TStateId, delay: TransAfterDynamicCondition<TStateId, number>, condition?: TransAfterDynamicCondition<TStateId, boolean>, forceInstantly?: boolean);
        onEnter(): void;
        shouldTransition(): boolean;
    }
    type STransitionAfterDynamic = TransitionAfterDynamic<string>;
}
declare namespace fsm {
    interface IStateMachine<TStateId> {
        stateCanExit(): any;
        requestStateChange(name: TStateId, forceInstantly: boolean): any;
        readonly activeState: any;
    }
}
declare namespace fsm {
    interface ITriggerable<TEvent> {
        trigger(trigger: TEvent): any;
    }
    type ISTriggerable = ITriggerable<string>;
}
declare namespace fsm.exceptions {
    class ExceptionFormatter {
        static format(context?: string, problem?: string, solution?: string): string;
    }
}
declare namespace fsm.exceptions {
    class StateMachineNotInitializedException extends Error {
        static format(context?: string, problem?: string, solution?: string): string;
        constructor(context?: string, problem?: string, solution?: string);
    }
}
declare namespace fsm.exceptions {
    class StateNotFoundException<TState> extends Error {
        static format<TState>(stateName: TState, context?: string, problem?: string, solution?: string): string;
        constructor(stateName: TState, context?: string, problem?: string, solution?: string);
    }
}
