namespace fsm {
    export type AfterTransCondition<TStateId> = (args: TransitionAfter<TStateId>) => boolean;


    export abstract class TransitionAfter<TStateId> extends TransitionBase<TStateId>{

        public delay: number;

        public condition: AfterTransCondition<TStateId>;

        public timer: number;

        public constructor(
            from: TStateId,
            to: TStateId,
            delay: number,
            condition: AfterTransCondition<TStateId> = null,
            forceInstantly = false,
        ) {
            super(from, to, forceInstantly);
            this.delay = delay;
            this.condition = condition;
            this.timer = Date.now();
        }

        public onEnter() {
            this.timer = Date.now();
        }

        public shouldTransition(): boolean {
            const diff = Date.now() - this.timer;
            if (diff < this.delay) {
                return false;
            }
            if (this.condition === null) {
                return false;
            }

            return this.condition?.call(this, this);
        }
    }

    export type STransitionAfter = TransitionAfter<string>;

}
