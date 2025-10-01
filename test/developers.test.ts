import 'reflect-metadata'
import { request } from './setup/shortcuts'
import { createRequestWithContainerOverrides } from './setup/helpers'
import { DevelopersRepository } from '../src/domain/developers/repositories/developers.repository'

describe('Developers API tests examples', () => {

	it('should BAT fetch developers (e2e, real repository used)', async () => {

		const result = await request.get(`/api/developers`)

		expect(result.status).toBe(200)
		expect(result.body?.length).toBeGreaterThan(0)

		for (const developer of result.body) {
			expect(developer).toHaveProperty('id')
			expect(developer).toHaveProperty('firstName')
			expect(developer).toHaveProperty('lastName')
			expect(developer).toHaveProperty('email')
			expect(developer).not.toHaveProperty('revenue')
		}

	})

	it('should BAT get developer by id (mocked repository used)', async () => {

		const req = await createRequestWithContainerOverrides({
			'DevelopersRepository': {
				toConstantValue: {
					getDeveloperById: async (_id) => ({
						"id": "65de346c255f31cb84bd10e9",
						"email": "Brandon30@hotmail.com",
						"firstName": "Brandon",
						"lastName": "D'Amore"
					})
				} as Partial<DevelopersRepository>
			}
		})

		const result = await req.get(`/api/developers/65de346c255f31cb84bd10e9`)

		expect(result.status).toBe(200)

		const developer = result.body
		expect(developer).toHaveProperty('id')
		expect(developer).toHaveProperty('firstName')
		expect(developer).toHaveProperty('lastName')
		expect(developer).toHaveProperty('email')

	})

	describe('Revenue data', () => {
		let req: any

		beforeEach(async () => {
			req = await createRequestWithContainerOverrides({
				'DevelopersRepository': {
					toConstantValue: {
						getDevelopers: async () => [{
							"id": "65de346c255f31cb84bd105c",
							"email": "Oran_Schroeder97@yahoo.com",
							"firstName": "Oran",
							"lastName": "Schroeder"
						},
						{
							"id": "65de346a255f31cb84bd0e01",
							"email": "Katheryn82@hotmail.com",
							"firstName": "Katheryn",
							"lastName": "Hammes"
						},],
						getContracts: async () => [
							{
								id: 5,
								developerId: '65de346a255f31cb84bd0e01',
								status: 'completed',
								amount: 6000
							},
							{
								id: 6,
								developerId: '65de346a255f31cb84bd0e01',
								status: 'completed',
								amount: 5000
							},
						],
					} as Partial<DevelopersRepository>
				}
			})
		})

		it('should include revenue when include=revenue is specified', async () => {
			const result = await req.get(`/api/developers/?include=revenue`)

			expect(result.status).toBe(200)
			expect(Array.isArray(result.body)).toBe(true)

			const developers = result.body
			const byId = (id: string) => developers.find((d: any) => d.id === id)

			const dev1 = byId('65de346a255f31cb84bd0e01')
			expect(dev1).toBeTruthy()
			expect(dev1).toHaveProperty('revenue', 11000)

			const dev2 = byId('65de346c255f31cb84bd105c')
			expect(dev2).toBeTruthy()
			expect(dev2).toHaveProperty('revenue', 0)
		})

		it('should ignore unknown include values and not include revenue', async () => {
			const result = await req.get(`/api/developers?include=something_else`)

			expect(result.status).toBe(200)
			for (const developer of result.body) {
				expect(developer).not.toHaveProperty('revenue')
			}
		})
	})
})
