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
			// revenue should not be present unless include=revenue is passed
			expect(developer).not.toHaveProperty('revenue')
		}

	})

	it('should include revenue when include=revenue is specified', async () => {

		const result = await request.get(`/api/developers?include=revenue`)

		expect(result.status).toBe(200)
		expect(Array.isArray(result.body)).toBe(true)

		// pick some known developers from seed data to validate revenue calculation
		const developers = result.body
		const byId = (id: string) => developers.find((d: any) => d.id === id)

		// 65de346c255f31cb84bd10e9 has one completed contract: 12000
		const devWith12000 = byId('65de346c255f31cb84bd10e9')
		expect(devWith12000).toBeTruthy()
		expect(devWith12000).toHaveProperty('revenue', 12000)

		// 65de346a255f31cb84bd0e01 has two completed: 6000 + 5000 = 11000
		const devWith11000 = byId('65de346a255f31cb84bd0e01')
		expect(devWith11000).toBeTruthy()
		expect(devWith11000).toHaveProperty('revenue', 11000)

		// a developer with no completed contracts should have revenue 0
		const devNoCompleted = byId('65de3467255f31cb84bd071d') // only pending/ongoing
		expect(devNoCompleted).toBeTruthy()
		expect(devNoCompleted).toHaveProperty('revenue', 0)

	})

	it('should ignore unknown include values and not include revenue', async () => {

		const result = await request.get(`/api/developers?include=something_else`)

		expect(result.status).toBe(200)
		for (const developer of result.body) {
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

})
