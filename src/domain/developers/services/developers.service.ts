import { inject, injectable } from 'inversify';
import { DevelopersRepository } from '../repositories/developers.repository';
import { IDeveloper } from '../types'

@injectable()
export class DevelopersService {

	constructor(
		@inject('DevelopersRepository') private developersRepository: DevelopersRepository,
	) { }

	private async getContractsSafe(): Promise<any[]> {
		try {
			const maybeFn: any = (this.developersRepository as any).getContracts
			if (typeof maybeFn !== 'function') return []
			const result = await maybeFn.call(this.developersRepository)
			return Array.isArray(result) ? result : []
		} catch (_e) {
			return []
		}
	}

	async getDevelopers(options?: { includeRevenue?: boolean }): Promise<IDeveloper[]> {
		const includeRevenue = !!options?.includeRevenue

		if (!includeRevenue) {
			return this.developersRepository.getDevelopers()
		}

		const [developers, contracts] = await Promise.all([
			this.developersRepository.getDevelopers(),
			this.getContractsSafe()
		])

		const completedByDeveloper = new Map<string, number>()
		for (const c of contracts) {
			if (c.status === 'completed') {
				completedByDeveloper.set(
					c.developerId,
					(completedByDeveloper.get(c.developerId) || 0) + (c.amount || 0)
				)
			}
		}

		return developers.map(d => ({
			...d,
			revenue: completedByDeveloper.get(d.id) || 0,
		}))
	}

	async getDeveloperById(id: string) {
		const [developer, contracts] = await Promise.all([
			this.developersRepository.getDeveloperById(id),
			this.getContractsSafe()
		])

		if (!developer) return developer

		let revenue = 0
		for (const c of contracts) {
			if (c.developerId === id && c.status === 'completed') {
				revenue += c.amount || 0
			}
		}

		return { ...developer, revenue }
	}

}
