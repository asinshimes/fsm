
namespace fsm {

    export interface IStateMachine<TStateId> {

        stateCanExit();

        requestStateChange(name: TStateId, forceInstantly: boolean);

        readonly activeState;
    }
}
