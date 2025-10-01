import { inject, injectable } from 'inversify';
import { DevelopersRepository } from '../repositories/developers.repository';
import { IDeveloper } from '../types'
import { computeCompletedRevenueByDeveloper, addRevenueToDevelopers } from '../utils'

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

		const revenueByDeveloper = computeCompletedRevenueByDeveloper(contracts)
		return addRevenueToDevelopers(developers, revenueByDeveloper)
	}

	async getDeveloperById(id: string) {
		return this.developersRepository.getDeveloperById(id)
	}

}
