export interface IDeveloper {

	id: string

	firstName?: string
	lastName?: string

	email: string

	// optional computed field, not persisted
	revenue?: number

}
