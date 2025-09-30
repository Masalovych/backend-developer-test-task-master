import {
	interfaces,
	controller,
	BaseHttpController,
	httpGet, requestParam, queryParam
} from 'inversify-express-utils';
import { ApiOperationGet, ApiPath } from 'swagger-express-ts';
import {
	path, getDevelopers, getDeveloperById
} from '../swagger/developers.swagger.docs';
import { inject } from 'inversify'
import { DevelopersService } from '../../domain/developers/services/developers.service'
import { DeveloperDto } from '../dto/developers.responses.dto'

@controller('/api/developers')
@ApiPath(path)
export class DevelopersController extends BaseHttpController implements interfaces.Controller {

	constructor(
		@inject('DevelopersService') private developersService: DevelopersService,
	) { super() }

	@httpGet('/')
	@ApiOperationGet(getDevelopers)
	public async getDevelopers(@queryParam('include') include?: string): Promise<DeveloperDto[]> {
		const includeRevenue = include === 'revenue'
		return this.developersService.getDevelopers({ includeRevenue })
	}

	@httpGet('/:id')
	@ApiOperationGet(getDeveloperById)
	public async getDeveloperById(@requestParam('id') id: string): Promise<DeveloperDto> {
		return this.developersService.getDeveloperById(id)
	}

}
