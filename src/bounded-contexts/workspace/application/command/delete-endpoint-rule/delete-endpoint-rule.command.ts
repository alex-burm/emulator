export class DeleteEndpointRuleCommand {
    constructor(
        public readonly projectId: number,
        public readonly ruleId: number,
    ) {}
}
