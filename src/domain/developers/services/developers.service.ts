import { inject, injectable } from 'inversify';
import { DevelopersRepository } from '../repositories/developers.repository';
import { IDeveloper } from '../types'

@injectable()
export class DevelopersService {

	constructor(
		@inject('DevelopersRepository') private developersRepository: DevelopersRepository,
	) {}

	async getDevelopers(options?: { includeRevenue?: boolean }): Promise<IDeveloper[]> {
		const includeRevenue = !!options?.includeRevenue

		if (!includeRevenue) {
			return this.developersRepository.getDevelopers()
		}

		const [developers, contracts] = await Promise.all([
			this.developersRepository.getDevelopers(),
			this.developersRepository.getContracts(),
		])

		const completedByDeveloper = new Map<string, number>()
		for (const contract of contracts) {
			if (contract.status === 'completed') {
				completedByDeveloper.set(
					contract.developerId,
					(completedByDeveloper.get(contract.developerId) || 0) + (contract.amount || 0)
				)
			}
		}

		return developers.map(developer => ({
			...developer,
			revenue: completedByDeveloper.get(developer.id) || 0,
		}))
	}

	async getDeveloperById(id: string) {
		return this.developersRepository.getDeveloperById(id)
	}

}
