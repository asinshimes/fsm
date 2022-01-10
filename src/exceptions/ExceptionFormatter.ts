namespace fsm.exceptions {

    export class ExceptionFormatter {
        static format(context: string = null, problem: string = null, solution: string = null) {

            let message = '\n';

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
        }
    }
}