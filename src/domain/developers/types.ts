export interface IDeveloper {
	id: string
	firstName?: string
	lastName?: string
	email: string
	revenue?: number
}

export interface IContract {
	id: string
	developerId: string
	status?: string
	amount?: number
}
