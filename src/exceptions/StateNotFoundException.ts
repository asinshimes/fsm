
namespace fsm.exceptions {
    export class StateNotFoundException<TState> extends Error {

        static format<TState>(stateName: TState, context: string = null, problem: string = null, solution: string = null) {

            if (problem == null) {
                problem = `The state "${stateName}" has not been defined yet / doesn't exist.`;
            }

            if (solution == null) {
                solution = '\n'
                    + '1. Check that there are no typos in the state names and transition from and to names\n'
                    + '2. Add this state before calling Init / OnEnter / OnLogic / RequestStateChange / ...';
            }

            return ExceptionFormatter.format(context, problem, solution);
        }
        public constructor(
            stateName: TState,
            context?: string,
            problem?: string,
            solution?: string,
        ) {
            super(StateNotFoundException.format(stateName, context, problem, solution));
        }
    }

}