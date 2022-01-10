namespace fsm {
    export type TransAfterDynamicCondition<TStateId, TRet> = (args: TransitionAfterDynamic<TStateId>) => TRet;


    export abstract class TransitionAfterDynamic<TStateId> extends TransitionBase<TStateId>{

        public delay: TransAfterDynamicCondition<TStateId, number>;

        public condition: TransAfterDynamicCondition<TStateId, boolean>;

        public timer: number;

        public constructor(
            from: TStateId,
            to: TStateId,
            delay: TransAfterDynamicCondition<TStateId, number>,
            condition: TransAfterDynamicCondition<TStateId, boolean> = null,
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
            if (diff < this.delay.call(this, this)) {
                return false;
            }
            if (this.condition === null) {
                return false;
            }

            return this.condition.call(this, this);
        }
    }

    export type STransitionAfterDynamic = TransitionAfterDynamic<string>;

}
