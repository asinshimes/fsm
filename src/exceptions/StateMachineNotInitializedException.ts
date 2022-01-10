
namespace fsm.exceptions {
    export class StateMachineNotInitializedException extends Error {

        static format(context: string = null, problem: string = null, solution: string = null) {

            if (problem == null) {
                problem = 'The active state is null because the state machine has not been set up yet.';
            }

            if (solution == null) {
                solution = 'Call fsm.setStartState(...) and fsm.init() or fsm.onEnter() '
                    + 'to initialize the state machine.';
            }

            return ExceptionFormatter.format(context, problem, solution);
        }
        public constructor(
            context?: string,
            problem?: string,
            solution?: string,
        ) {
            super(StateMachineNotInitializedException.format(context, problem, solution));
        }
    }

}