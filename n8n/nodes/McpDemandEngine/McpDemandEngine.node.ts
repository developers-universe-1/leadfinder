import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class McpDemandEngine implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MCP Demand Engine',
		name: 'mcpDemandEngine',
		icon: 'file:mcpdemand.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'LinkedIn signals, ICP scoring, enrichment, and CRM routing via MCP',
		defaults: {
			name: 'MCP Demand Engine',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mcpDemandEngineApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Detect Signals',
						value: 'detectSignals',
						action: 'Detect LinkedIn engagement signals',
					},
					{
						name: 'Score ICP',
						value: 'scoreIcp',
						action: 'Score a lead against ICP',
					},
					{
						name: 'Enrich Contact',
						value: 'enrichContact',
						action: 'Enrich contact with Apollo/Clearbit',
					},
					{
						name: 'Route to CRM',
						value: 'routeToCrm',
						action: 'Route qualified lead to CRM',
					},
					{
						name: 'Get Lead Feed',
						value: 'getLeadFeed',
						action: 'Get qualified lead feed',
					},
				],
				default: 'getLeadFeed',
			},
			{
				displayName: 'LinkedIn URL',
				name: 'linkedinUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['scoreIcp', 'enrichContact'],
					},
				},
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['routeToCrm'],
					},
				},
			},
			{
				displayName: 'CRM',
				name: 'crm',
				type: 'options',
				options: [
					{ name: 'Salesforce', value: 'salesforce' },
					{ name: 'HubSpot', value: 'hubspot' },
				],
				default: 'salesforce',
				displayOptions: {
					show: {
						operation: ['routeToCrm'],
					},
				},
			},
		] as INodeProperties[],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('mcpDemandEngineApi');
		const baseUrl = (credentials?.baseUrl as string) || 'http://localhost:3000';

		for (let i = 0; i < items.length; i++) {
			try {
				let endpoint = '';
				let method = 'GET';
				let body: Record<string, unknown> | undefined;

				if (operation === 'getLeadFeed') {
					endpoint = '/api/leads';
				} else if (operation === 'detectSignals') {
					endpoint = '/api/signals';
				} else if (operation === 'scoreIcp') {
					const linkedinUrl = this.getNodeParameter('linkedinUrl', i) as string;
					endpoint = `/api/leads/score?url=${encodeURIComponent(linkedinUrl)}`;
				} else if (operation === 'enrichContact') {
					const linkedinUrl = this.getNodeParameter('linkedinUrl', i) as string;
					endpoint = '/api/leads/enrich';
					method = 'POST';
					body = { linkedinUrl };
				} else if (operation === 'routeToCrm') {
					const leadId = this.getNodeParameter('leadId', i) as string;
					const crm = this.getNodeParameter('crm', i) as string;
					endpoint = '/api/leads/route';
					method = 'POST';
					body = { leadId, crm };
				}

				const options: RequestInit = {
					method,
					headers: {
						'Content-Type': 'application/json',
					},
				};
				if (body) options.body = JSON.stringify(body);

				const response = await fetch(`${baseUrl}${endpoint}`, options);
				const data = await response.json();

				returnData.push({
					json: data,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
