import { IDeveloper, IContract } from './types'

export function computeCompletedRevenueByDeveloper(contracts: IContract[]): Map<string, number> {
  const completedByDeveloper = new Map<string, number>()
  for (const contract of contracts || []) {
    if (contract && contract.status === 'completed') {
      completedByDeveloper.set(
        contract.developerId,
        (completedByDeveloper.get(contract.developerId) || 0) + (contract.amount || 0)
      )
    }
  }
  return completedByDeveloper
}

export function addRevenueToDevelopers(
  developers: IDeveloper[],
  revenueByDeveloper: Map<string, number>
): IDeveloper[] {
  return (developers || []).map(developer => ({
    ...developer,
    revenue: revenueByDeveloper.get(developer.id) || 0,
  }))
}


