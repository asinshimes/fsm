/* eslint-disable @typescript-eslint/no-empty-function */

namespace fsm {

    export class TransitionBase<TStateId>{
        public from: TStateId;
        public to: TStateId;

        public forceInstantly: boolean;

        public fsm: IStateMachine<TStateId>;


        public constructor(from: TStateId, to: TStateId, forceInstantly = false) {
            this.from = from;
            this.to = to;
            this.forceInstantly = forceInstantly;
        }

        public init() {

        }

        public onEnter() {

        }

        public shouldTransition(): boolean {
            return true;
        }
    }

    export type STransitionBase = TransitionBase<string>

}
