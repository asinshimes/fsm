var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* eslint-disable @typescript-eslint/no-empty-function */
var fsm;
(function (fsm) {
    var StateBase = /** @class */ (function () {
        function StateBase(needsExitTime) {
            this.needsExitTimes = needsExitTime;
        }
        StateBase.prototype.init = function () {
        };
        StateBase.prototype.onEnter = function () {
        };
        StateBase.prototype.onLogic = function () {
        };
        StateBase.prototype.onExit = function () {
        };
        StateBase.prototype.requestExit = function () {
        };
        return StateBase;
    }());
    fsm.StateBase = StateBase;
    __reflect(StateBase.prototype, "fsm.StateBase");
})(fsm || (fsm = {}));
var fsm;
(function (fsm) {
    var StateMachine = /** @class */ (function (_super) {
        __extends(StateMachine, _super);
        function StateMachine(needsExitTimes) {
            if (needsExitTimes === void 0) { needsExitTimes = true; }
            var _this = _super.call(this, needsExitTimes) || this;
            _this.startState = { hasState: false, state: null };
            _this.pendingState = { isPending: false, state: null };
            _this.nameToStateBundle = new Map();
            _this._activeState = null;
            _this.activeTransitions = StateMachine.noTranstions;
            _this.activeTriggerTransitions = StateMachine.noTriggerTranstions;
            _this.transitionsFromAny = [];
            _this.triggerTransitionsFromAny = new Map();
            return _this;
        }
        Object.defineProperty(StateMachine.prototype, "activeStateName", {
            get: function () {
                return this.activeState.name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(StateMachine.prototype, "isRootFsm", {
            get: function () {
                return !this.fsm;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(StateMachine.prototype, "activeState", {
            get: function () {
                if (!this._activeState) {
                    throw new fsm.exceptions.StateMachineNotInitializedException('Trying to get the active state');
                }
                return this._activeState;
            },
            enumerable: false,
            configurable: true
        });
        StateMachine.prototype.stateCanExit = function () {
            var _a;
            var pendingState = this.pendingState;
            if (pendingState.isPending) {
                this.changeState(pendingState.state);
                pendingState.state = false;
            }
            (_a = this.fsm) === null || _a === void 0 ? void 0 : _a.stateCanExit();
        };
        StateMachine.prototype.requestExit = function () {
            var _a;
            if (this.activeState.needsExitTimes) {
                this.activeState.requestExit();
                return;
            }
            (_a = this.fsm) === null || _a === void 0 ? void 0 : _a.stateCanExit();
        };
        StateMachine.prototype.requestStateChange = function (name, forceInstantly) {
            if (!this.activeState.needsExitTimes || forceInstantly) {
                this.changeState(name);
            }
            else {
                this.pendingState.state = name;
                this.pendingState.isPending = true;
                this.activeState.requestExit();
            }
        };
        StateMachine.prototype.setStartState = function (name) {
            this.startState.state = name;
            this.startState.hasState = true;
        };
        StateMachine.prototype.init = function () {
            if (!this.isRootFsm) {
                return;
            }
            this.onEnter();
        };
        StateMachine.prototype.onEnter = function () {
            if (!this.startState.hasState) {
                throw new Error(fsm.exceptions.ExceptionFormatter.format('Running OnEnter of the state machine.', "No start state is selected. \n                        'The state machine needs at least one state to function properly.", "Make sure that there is at least one state in the state machine \n                         before running Init() or OnEnter() by calling fsm.AddState(...)."));
            }
            this.changeState(this.startState.state);
            this.transitionsFromAny.forEach(function (value) {
                value.onEnter();
            });
            this.triggerTransitionsFromAny.forEach(function (transtions) {
                transtions.forEach(function (value) {
                    value.onEnter();
                });
            });
        };
        StateMachine.prototype.onLogic = function () {
            if (!this.activeState) {
                throw new fsm.exceptions.StateMachineNotInitializedException('running onlogic');
            }
            var _a = this, transitionsFromAny = _a.transitionsFromAny, activeTransitions = _a.activeTransitions;
            var length = transitionsFromAny.length;
            for (var i = 0; i < length; i++) {
                var transition = transitionsFromAny[i];
                if (transition.to == this.activeState.name) {
                    continue;
                }
                if (this.tryTransition(transition)) {
                    break;
                }
            }
            length = activeTransitions.length;
            for (var i = 0; i < length; i++) {
                var transition = activeTransitions[i];
                if (this.tryTransition(transition)) {
                    break;
                }
            }
            this.activeState.onLogic();
        };
        StateMachine.prototype.onExit = function () {
            if (this.activeState) {
                this.activeState.onExit();
                this._activeState = null;
            }
        };
        StateMachine.prototype.addState = function (name, state, onLogic, onExit, canExit, needsExitTime) {
            if (state instanceof fsm.StateBase) {
                state.fsm = this;
                state.name = name;
                state.init();
                var bundle = this.getOrCreateStateBundle(name);
                bundle.state = state;
                if (this.nameToStateBundle.size === 1 && !this.startState.hasState) {
                    this.setStartState(name);
                }
            }
            else {
                if (!state && !onLogic && !onExit && !canExit) {
                    this.addState(name, new fsm.StateBase(needsExitTime));
                    return;
                }
                this.addState(name, new fsm.State(state, onLogic, onExit, canExit, needsExitTime));
            }
        };
        StateMachine.prototype.addTransition = function (transition, to, condition, forceInstantly) {
            if (condition === void 0) { condition = null; }
            if (forceInstantly === void 0) { forceInstantly = false; }
            if (transition instanceof fsm.TransitionBase) {
                this.initTransition(transition);
                var bundle = this.getOrCreateStateBundle(transition.from);
                bundle.addTransition(transition);
            }
            else {
                this.addTransition(this.createOptimizedTransition(null, to, condition, forceInstantly));
            }
        };
        StateMachine.prototype.addTransitionFromAny = function (transition, condition, forceInstantly) {
            if (condition === void 0) { condition = null; }
            if (forceInstantly === void 0) { forceInstantly = false; }
            if (transition instanceof fsm.TransitionBase) {
                this.initTransition(transition);
                this.transitionsFromAny.push(transition);
            }
            else {
                this.addTransitionFromAny(this.createOptimizedTransition(null, transition, condition, forceInstantly));
            }
        };
        StateMachine.prototype.addTriggerTransition = function (trigger, transition, to, condition, forceInstantly) {
            if (transition instanceof fsm.TransitionBase) {
                this.initTransition(transition);
                var bundle = this.getOrCreateStateBundle(transition.from);
                bundle.addTriggerTranstion(trigger, transition);
                return;
            }
            this.addTriggerTransition(trigger, this.createOptimizedTransition(transition, to, condition, forceInstantly));
        };
        StateMachine.prototype.trigger = function (trigger) {
            if (this.tryTrigger(trigger)) {
                return;
            }
            var state = this.activeState;
            if (state.trigger) {
                state.trigger(trigger);
            }
        };
        StateMachine.prototype.triggerLocally = function (trigger) {
            this.tryTrigger(trigger);
        };
        StateMachine.prototype.getState = function (name) {
            var bundle = this.nameToStateBundle.get(name);
            if (!bundle || !bundle.state) {
                throw new fsm.exceptions.StateNotFoundException(name, 'Getting a state');
            }
            return bundle.state;
        };
        StateMachine.prototype.get = function (name) {
            var state = this.getState(name);
            if (state instanceof StateMachine) {
                return state;
            }
            throw new Error(fsm.exceptions.ExceptionFormatter.format('Getting a nested state machine with the indexer', 'The selected state is not a state machine.', "This method is only there for quickly accessing a nested state machine.\n                    To get the selected state, use GetState(" + name + ")."));
        };
        StateMachine.prototype.changeState = function (name) {
            var _a, _b, _c;
            (_a = this.activeState) === null || _a === void 0 ? void 0 : _a.onExit();
            var bundle = this.nameToStateBundle.get(name);
            if (!bundle || !bundle.state) {
                throw new fsm.exceptions.StateNotFoundException(name, 'Switching states');
            }
            this.activeTransitions = (_b = bundle.transitions) !== null && _b !== void 0 ? _b : StateMachine.noTranstions;
            this.activeTriggerTransitions = (_c = bundle.triggerToTransitions) !== null && _c !== void 0 ? _c : StateMachine.noTriggerTranstions;
            this._activeState = bundle.state;
            this.activeState.onEnter();
            this.activeTransitions.forEach(function (value) {
                value.onEnter();
            });
            this.activeTriggerTransitions.forEach(function (transtions) {
                transtions.forEach(function (value) {
                    value.onEnter();
                });
            });
        };
        StateMachine.prototype.tryTransition = function (transition) {
            if (!transition.shouldTransition()) {
                return false;
            }
            this.requestStateChange(transition.to, transition.forceInstantly);
            return true;
        };
        StateMachine.prototype.getOrCreateStateBundle = function (name) {
            var bundle = this.nameToStateBundle.get(name);
            if (!bundle) {
                bundle = new StateBundle();
                this.nameToStateBundle.set(name, bundle);
            }
            return bundle;
        };
        StateMachine.prototype.initTransition = function (transition) {
            transition.fsm = this;
            transition.init();
        };
        StateMachine.prototype.tryTrigger = function (trigger) {
            if (!this.activeState) {
                throw new fsm.exceptions.StateMachineNotInitializedException('Checking all trigger transitions of the active state');
            }
            var triggerTransitions = this.triggerTransitionsFromAny.get(trigger);
            if (triggerTransitions) {
                var length_1 = triggerTransitions.length;
                for (var i = 0; i < length_1; i++) {
                    var transition = triggerTransitions[i];
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
                var length_2 = triggerTransitions.length;
                for (var i = 0; i < length_2; i++) {
                    var transition = triggerTransitions[i];
                    if (this.tryTransition(transition)) {
                        return true;
                    }
                }
            }
            return false;
        };
        StateMachine.prototype.createOptimizedTransition = function (from, to, condition, forceInstantly) {
            if (condition === void 0) { condition = null; }
            if (forceInstantly === void 0) { forceInstantly = false; }
            if (condition == null)
                return new fsm.TransitionBase(from, to, forceInstantly);
            return new fsm.Transition(from, to, condition, forceInstantly);
        };
        StateMachine.noTranstions = [];
        StateMachine.noTriggerTranstions = new Map();
        return StateMachine;
    }(fsm.StateBase));
    fsm.StateMachine = StateMachine;
    __reflect(StateMachine.prototype, "fsm.StateMachine", ["fsm.ITriggerable", "fsm.IStateMachine"]);
    var StateBundle = /** @class */ (function () {
        function StateBundle() {
        }
        StateBundle.prototype.addTransition = function (t) {
            if (!this.transitions) {
                this.transitions = [];
            }
            this.transitions.push(t);
        };
        StateBundle.prototype.addTriggerTranstion = function (trigger, transtion) {
            if (!this.triggerToTransitions) {
                this.triggerToTransitions = new Map();
            }
            if (!this.triggerToTransitions.has(trigger)) {
                this.triggerToTransitions.set(trigger, []);
            }
            this.triggerToTransitions.get(trigger).push(transtion);
        };
        return StateBundle;
    }());
    __reflect(StateBundle.prototype, "StateBundle");
})(fsm || (fsm = {}));
/* eslint-disable @typescript-eslint/no-empty-function */
var fsm;
(function (fsm) {
    var TransitionBase = /** @class */ (function () {
        function TransitionBase(from, to, forceInstantly) {
            if (forceInstantly === void 0) { forceInstantly = false; }
            this.from = from;
            this.to = to;
            this.forceInstantly = forceInstantly;
        }
        TransitionBase.prototype.init = function () {
        };
        TransitionBase.prototype.onEnter = function () {
        };
        TransitionBase.prototype.shouldTransition = function () {
            return true;
        };
        return TransitionBase;
    }());
    fsm.TransitionBase = TransitionBase;
    __reflect(TransitionBase.prototype, "fsm.TransitionBase");
})(fsm || (fsm = {}));
var fsm;
(function (fsm) {
    var HybridStateMachine = /** @class */ (function (_super) {
        __extends(HybridStateMachine, _super);
        function HybridStateMachine(_enter, _logic, _exit, needsExitTimes) {
            if (_enter === void 0) { _enter = null; }
            if (_logic === void 0) { _logic = null; }
            if (_exit === void 0) { _exit = null; }
            if (needsExitTimes === void 0) { needsExitTimes = false; }
            var _this = _super.call(this, needsExitTimes) || this;
            _this._enter = _enter;
            _this._logic = _logic;
            _this._exit = _exit;
            _this.timer = Date.now();
            return _this;
        }
        HybridStateMachine.prototype.onEnter = function () {
            var _a;
            _super.prototype.onEnter.call(this);
            this.timer = Date.now();
            (_a = this._enter) === null || _a === void 0 ? void 0 : _a.call(this, this);
        };
        HybridStateMachine.prototype.onLogic = function () {
            _super.prototype.onLogic.call(this);
            this._logic.call(this, this);
        };
        HybridStateMachine.prototype.onExit = function () {
            _super.prototype.onExit.call(this);
            this._logic.call(this, this);
        };
        return HybridStateMachine;
    }(fsm.StateMachine));
    fsm.HybridStateMachine = HybridStateMachine;
    __reflect(HybridStateMachine.prototype, "fsm.HybridStateMachine");
})(fsm || (fsm = {}));
var fsm;
(function (fsm) {
    var State = /** @class */ (function (_super) {
        __extends(State, _super);
        function State(_onEnter, _onLogic, _onExit, _canExit, needsExitTime) {
            if (_onEnter === void 0) { _onEnter = null; }
            if (_onLogic === void 0) { _onLogic = null; }
            if (_onExit === void 0) { _onExit = null; }
            if (_canExit === void 0) { _canExit = null; }
            if (needsExitTime === void 0) { needsExitTime = true; }
            var _this = _super.call(this, needsExitTime) || this;
            _this._onEnter = _onEnter;
            _this._onLogic = _onLogic;
            _this._onExit = _onExit;
            _this._canExit = _canExit;
            return _this;
        }
        State.prototype.init = function () {
            this.timer = Date.now();
        };
        State.prototype.onEnter = function () {
            var _a;
            this.timer = Date.now();
            (_a = this._onEnter) === null || _a === void 0 ? void 0 : _a.call(this, this);
        };
        State.prototype.onLogic = function () {
            var _a;
            (_a = this._onLogic) === null || _a === void 0 ? void 0 : _a.call(this, this);
        };
        State.prototype.onExit = function () {
            var _a;
            (_a = this._onExit) === null || _a === void 0 ? void 0 : _a.call(this, this);
        };
        State.prototype.requestExit = function () {
            var _a;
            if (!this.needsExitTimes || ((_a = this._canExit) === null || _a === void 0 ? void 0 : _a.call(this, this))) {
                this.fsm.stateCanExit();
            }
        };
        return State;
    }(fsm.StateBase));
    fsm.State = State;
    __reflect(State.prototype, "fsm.State");
})(fsm || (fsm = {}));
var fsm;
(function (fsm_1) {
    var StateWrapper = /** @class */ (function () {
        function StateWrapper(beforeOnEnter, afterOnEnter, beforeOnLogic, afterOnLogic, beforeOnExit, afterOnExit) {
            if (beforeOnEnter === void 0) { beforeOnEnter = null; }
            if (afterOnEnter === void 0) { afterOnEnter = null; }
            if (beforeOnLogic === void 0) { beforeOnLogic = null; }
            if (afterOnLogic === void 0) { afterOnLogic = null; }
            if (beforeOnExit === void 0) { beforeOnExit = null; }
            if (afterOnExit === void 0) { afterOnExit = null; }
            this.beforeOnEnter = beforeOnEnter;
            this.afterOnEnter = afterOnEnter;
            this.beforeOnLogic = beforeOnLogic;
            this.afterOnLogic = afterOnLogic;
            this.beforeOnExit = beforeOnExit;
            this.afterOnExit = afterOnExit;
        }
        StateWrapper.prototype.warp = function (state) {
            return new WrappedState(state, this.beforeOnEnter, this.afterOnEnter, this.beforeOnLogic, this.afterOnLogic, this.beforeOnExit, this.afterOnExit);
        };
        return StateWrapper;
    }());
    fsm_1.StateWrapper = StateWrapper;
    __reflect(StateWrapper.prototype, "fsm.StateWrapper");
    var WrappedState = /** @class */ (function (_super) {
        __extends(WrappedState, _super);
        function WrappedState(state, beforeOnEnter, afterOnEnter, beforeOnLogic, afterOnLogic, beforeOnExit, afterOnExit) {
            if (beforeOnEnter === void 0) { beforeOnEnter = null; }
            if (afterOnEnter === void 0) { afterOnEnter = null; }
            if (beforeOnLogic === void 0) { beforeOnLogic = null; }
            if (afterOnLogic === void 0) { afterOnLogic = null; }
            if (beforeOnExit === void 0) { beforeOnExit = null; }
            if (afterOnExit === void 0) { afterOnExit = null; }
            var _this = _super.call(this, state.needsExitTimes) || this;
            _this.state = state;
            _this.beforeOnEnter = beforeOnEnter;
            _this.afterOnEnter = afterOnEnter;
            _this.beforeOnLogic = beforeOnLogic;
            _this.afterOnLogic = afterOnLogic;
            _this.beforeOnExit = beforeOnExit;
            _this.afterOnExit = afterOnExit;
            return _this;
        }
        WrappedState.prototype.init = function () {
            var _a = this, state = _a.state, name = _a.name, fsm = _a.fsm;
            state.name = name;
            state.fsm = fsm;
            state.init();
        };
        WrappedState.prototype.onEnter = function () {
            var _a, _b;
            (_a = this.beforeOnEnter) === null || _a === void 0 ? void 0 : _a.call(this, this);
            this.state.onEnter();
            (_b = this.afterOnEnter) === null || _b === void 0 ? void 0 : _b.call(this, this);
        };
        WrappedState.prototype.onLogic = function () {
            var _a, _b;
            (_a = this.beforeOnLogic) === null || _a === void 0 ? void 0 : _a.call(this, this);
            this.state.onLogic();
            (_b = this.afterOnLogic) === null || _b === void 0 ? void 0 : _b.call(this, this);
        };
        WrappedState.prototype.onExit = function () {
            var _a, _b;
            (_a = this.beforeOnExit) === null || _a === void 0 ? void 0 : _a.call(this, this);
            this.state.onExit();
            (_b = this.afterOnExit) === null || _b === void 0 ? void 0 : _b.call(this, this);
        };
        WrappedState.prototype.requestExit = function () {
            this.state.requestExit();
        };
        WrappedState.prototype.trigger = function (trigger) {
            var state = this.state;
            if (state.trigger) {
                state.trigger.call(state, trigger);
            }
        };
        return WrappedState;
    }(fsm_1.StateBase));
    __reflect(WrappedState.prototype, "WrappedState", ["fsm.ITriggerable"]);
})(fsm || (fsm = {}));
var fsm;
(function (fsm) {
    var Transition = /** @class */ (function (_super) {
        __extends(Transition, _super);
        function Transition(from, to, condition, forceInstantly) {
            if (condition === void 0) { condition = null; }
            if (forceInstantly === void 0) { forceInstantly = false; }
            var _this = _super.call(this, from, to, forceInstantly) || this;
            _this.condition = condition;
            return _this;
        }
        Transition.prototype.shouldTransition = function () {
            var _a;
            if (this.condition == null)
                return true;
            return (_a = this.condition) === null || _a === void 0 ? void 0 : _a.call(this, this);
        };
        return Transition;
    }(fsm.TransitionBase));
    fsm.Transition = Transition;
    __reflect(Transition.prototype, "fsm.Transition");
})(fsm || (fsm = {}));
var fsm;
(function (fsm) {
    var TransitionAfter = /** @class */ (function (_super) {
        __extends(TransitionAfter, _super);
        function TransitionAfter(from, to, delay, condition, forceInstantly) {
            if (condition === void 0) { condition = null; }
            if (forceInstantly === void 0) { forceInstantly = false; }
            var _this = _super.call(this, from, to, forceInstantly) || this;
            _this.delay = delay;
            _this.condition = condition;
            _this.timer = Date.now();
            return _this;
        }
        TransitionAfter.prototype.onEnter = function () {
            this.timer = Date.now();
        };
        TransitionAfter.prototype.shouldTransition = function () {
            var _a;
            var diff = Date.now() - this.timer;
            if (diff < this.delay) {
                return false;
            }
            if (this.condition === null) {
                return false;
            }
            return (_a = this.condition) === null || _a === void 0 ? void 0 : _a.call(this, this);
        };
        return TransitionAfter;
    }(fsm.TransitionBase));
    fsm.TransitionAfter = TransitionAfter;
    __reflect(TransitionAfter.prototype, "fsm.TransitionAfter");
})(fsm || (fsm = {}));
var fsm;
(function (fsm) {
    var TransitionAfterDynamic = /** @class */ (function (_super) {
        __extends(TransitionAfterDynamic, _super);
        function TransitionAfterDynamic(from, to, delay, condition, forceInstantly) {
            if (condition === void 0) { condition = null; }
            if (forceInstantly === void 0) { forceInstantly = false; }
            var _this = _super.call(this, from, to, forceInstantly) || this;
            _this.delay = delay;
            _this.condition = condition;
            _this.timer = Date.now();
            return _this;
        }
        TransitionAfterDynamic.prototype.onEnter = function () {
            this.timer = Date.now();
        };
        TransitionAfterDynamic.prototype.shouldTransition = function () {
            var diff = Date.now() - this.timer;
            if (diff < this.delay.call(this, this)) {
                return false;
            }
            if (this.condition === null) {
                return false;
            }
            return this.condition.call(this, this);
        };
        return TransitionAfterDynamic;
    }(fsm.TransitionBase));
    fsm.TransitionAfterDynamic = TransitionAfterDynamic;
    __reflect(TransitionAfterDynamic.prototype, "fsm.TransitionAfterDynamic");
})(fsm || (fsm = {}));
var fsm;
(function (fsm) {
    var exceptions;
    (function (exceptions) {
        var ExceptionFormatter = /** @class */ (function () {
            function ExceptionFormatter() {
            }
            ExceptionFormatter.format = function (context, problem, solution) {
                if (context === void 0) { context = null; }
                if (problem === void 0) { problem = null; }
                if (solution === void 0) { solution = null; }
                var message = '\n';
                if (context != null) {
                    message += 'Context: ' + context + '\n';
                }
                if (problem != null) {
                    message += 'Problem: ' + problem + '\n';
                }
                if (solution != null) {
                    message += 'Solution: ' + solution + '\n';
                }
                return message;
            };
            return ExceptionFormatter;
        }());
        exceptions.ExceptionFormatter = ExceptionFormatter;
        __reflect(ExceptionFormatter.prototype, "fsm.exceptions.ExceptionFormatter");
    })(exceptions = fsm.exceptions || (fsm.exceptions = {}));
})(fsm || (fsm = {}));
var fsm;
(function (fsm) {
    var exceptions;
    (function (exceptions) {
        var StateMachineNotInitializedException = /** @class */ (function (_super) {
            __extends(StateMachineNotInitializedException, _super);
            function StateMachineNotInitializedException(context, problem, solution) {
                return _super.call(this, StateMachineNotInitializedException.format(context, problem, solution)) || this;
            }
            StateMachineNotInitializedException.format = function (context, problem, solution) {
                if (context === void 0) { context = null; }
                if (problem === void 0) { problem = null; }
                if (solution === void 0) { solution = null; }
                if (problem == null) {
                    problem = 'The active state is null because the state machine has not been set up yet.';
                }
                if (solution == null) {
                    solution = 'Call fsm.setStartState(...) and fsm.init() or fsm.onEnter() '
                        + 'to initialize the state machine.';
                }
                return exceptions.ExceptionFormatter.format(context, problem, solution);
            };
            return StateMachineNotInitializedException;
        }(Error));
        exceptions.StateMachineNotInitializedException = StateMachineNotInitializedException;
        __reflect(StateMachineNotInitializedException.prototype, "fsm.exceptions.StateMachineNotInitializedException");
    })(exceptions = fsm.exceptions || (fsm.exceptions = {}));
})(fsm || (fsm = {}));
var fsm;
(function (fsm) {
    var exceptions;
    (function (exceptions) {
        var StateNotFoundException = /** @class */ (function (_super) {
            __extends(StateNotFoundException, _super);
            function StateNotFoundException(stateName, context, problem, solution) {
                return _super.call(this, StateNotFoundException.format(stateName, context, problem, solution)) || this;
            }
            StateNotFoundException.format = function (stateName, context, problem, solution) {
                if (context === void 0) { context = null; }
                if (problem === void 0) { problem = null; }
                if (solution === void 0) { solution = null; }
                if (problem == null) {
                    problem = "The state \"" + stateName + "\" has not been defined yet / doesn't exist.";
                }
                if (solution == null) {
                    solution = '\n'
                        + '1. Check that there are no typos in the state names and transition from and to names\n'
                        + '2. Add this state before calling Init / OnEnter / OnLogic / RequestStateChange / ...';
                }
                return exceptions.ExceptionFormatter.format(context, problem, solution);
            };
            return StateNotFoundException;
        }(Error));
        exceptions.StateNotFoundException = StateNotFoundException;
        __reflect(StateNotFoundException.prototype, "fsm.exceptions.StateNotFoundException");
    })(exceptions = fsm.exceptions || (fsm.exceptions = {}));
})(fsm || (fsm = {}));
