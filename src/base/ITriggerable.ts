namespace fsm {

    export interface ITriggerable<TEvent> {
        /// <summary>
        /// Called when a trigger is activated.
        /// </summary>
        /// <param name="trigger">The name / identifier of the trigger</param>
        trigger(trigger: TEvent);
    }

    export type ISTriggerable = ITriggerable<string>
}