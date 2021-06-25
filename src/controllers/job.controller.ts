import { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, DELETE, GET, getInstanceByToken, PATCH, POST } from 'fastify-decorators';
import JobService from '../services/job.service';
import FavoriteService from '../services/favorite.service';
import { addFavoriteJobSchema, createJobSchema, deleteJobSchema, filterSchema, getFavoriteJobSchema, getJobDetail, updateJobSchema } from './job.schema';
import Utility from 'utility-layer/dist/security';

const utility = new Utility();

@Controller({ route: '/api/v1/jobs' })
export default class JobController {

  private jobService = getInstanceByToken<JobService>(JobService);
  private favoriteService = getInstanceByToken<FavoriteService>(FavoriteService);

  @GET({
    url: '/',
    options: {
      schema: filterSchema
    }
  })
  async getAll(req: FastifyRequest<{ Querystring: any }>, reply: FastifyReply): Promise<object> {
    try {
      const { rowsPerPage = 10, page = 1 } = req.query
      const jobs = await this.jobService.getAllJob(req.query);
      return {
        data: jobs.data,
        size: rowsPerPage,
        currentPage: page,
        totalPages: Math.ceil(jobs.count / (+rowsPerPage)),
        totalElements: jobs.count,
        numberOfElements: jobs.data.length ?? 0,
      }
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

  @GET({
    url: '/:jobId',
    options: {
      schema: getJobDetail
    }
  })
  async getDetail(req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply): Promise<object> {
    try {
      return await this.jobService.getJobDetail(req.params.jobId);
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

  @POST({
    url: '/',
    options: {
      schema: createJobSchema
    }
  })
  async add(req: FastifyRequest<{ Headers: { authorization: string }, Body: any }>, reply: FastifyReply): Promise<object> {
    try {
      return await this.jobService.addJob(req.body, req.headers.authorization);
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

  @PATCH({
    url: '/:jobId',
    options: {
      schema: updateJobSchema
    }
  })
  async update(req: FastifyRequest<{ Headers: { authorization: string }, Params: { jobId: string }, Body: any }>, reply: FastifyReply): Promise<object> {
    try {
      const jobId = req.params.jobId;
      const data = req.body;
      const token = req.headers.authorization
      await this.jobService.updateDetail(jobId, data, token);
      return reply.status(204);
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

  @DELETE({
    url: '/:jobId',
    options: {
      schema: deleteJobSchema
    }
  })
  async delete(req: FastifyRequest<{ Headers: { authorization: string }, Params: { jobId: string } }>, reply: FastifyReply): Promise<object> {
    try {
      const jobId = req.params.jobId;
      const token = req.headers.authorization
      await this.jobService.deactivateJob(jobId, token);
      return reply.status(202);
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }
  // 1002250, 1002236
  @GET({
    url: '/favorite',
    options: {
      schema: getFavoriteJobSchema
    }
  })
  async getFavorite(req: FastifyRequest<{
    Headers: { authorization: string },
    Querystring: { descending?: boolean, rowsPerPage?: number, page?: number }
  }>, reply: FastifyReply): Promise<object> {
    try {
      const { descending = true, rowsPerPage = 10, page = 1 } = req.query
      const token = req.headers.authorization
      const userIdFromToken = utility.getUserIdByToken(token);
      const decodeUserId: string = utility.decodeUserId(userIdFromToken);
      const favorites = await this.favoriteService.getFavoriteJob(decodeUserId, descending, page, rowsPerPage);
      return {
        data: favorites.data,
        size: rowsPerPage,
        currentPage: page,
        totalPages: Math.ceil(favorites.count / (+rowsPerPage)),
        totalElements: favorites.count,
        numberOfElements: favorites.data.length ?? 0,
      }
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

  @POST({
    url: '/favorite',
    options: {
      schema: addFavoriteJobSchema
    }
  })
  async addOrDeleteFavorite(req: FastifyRequest<{
    Headers: { authorization: string },
    Body: { id: string }
  }>, reply: FastifyReply): Promise<object> {
    try {
      const jobId = req.body.id;
      const token = req.headers.authorization;
      const userIdFromToken = utility.getUserIdByToken(token);
      await this.favoriteService.addOrRemove(jobId, userIdFromToken);
      return reply.status(204).send();
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

}

/*
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjk4ZDNiMC01NTQwLTQxYjUtYWQwMi0zZjBlYWNiMGU1N2MiLCJyb2xlcyI6IkFkbWlufERyaXZlciIsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbS9hcC1zb3V0aGVhc3QtMV9oSVdCU1l6N3oiLCJjb2duaXRvOnVzZXJuYW1lIjoiZGI5OGQzYjAtNTU0MC00MWI1LWFkMDItM2YwZWFjYjBlNTdjIiwidXNlcklkIjoiUlpEUlIwS1giLCJjdXN0b206dXNlcklkIjoiUlpEUlIwS1giLCJvcmlnaW5fanRpIjoiNjU3YjA0YTQtOWFkYS00MGZmLThmYTctMWM1ZDUxYTU5ZDM0IiwiYXVkIjoiNHFrZDE0dTZuYTBmbzF0Zmh0cmRhcmk0MWkiLCJldmVudF9pZCI6ImJjODE3MTdhLTBhMjQtNGJhMC1hMzliLWZhOGVlMjczMzkwNyIsInRva2VuX3VzZSI6ImlkIiwianRpIjoiOTM4M2NjMTQtZjI5My00OTRkLTliOTQtM2YwOTYyMjVkMWU3IiwiYXV0aF90aW1lIjoxNjI0NjE5MTQxLCJleHAiOm51bGwsImlhdCI6MTYyNDYxOTE0MX0.quS6HsZgtB9ERCYV1dHAxFhlSLkmWxkr1stpWImwIW6-Sv4rba8jzte-ibI4l7Qp1ApH9qMhAWACn-G6JGsCRA
*/
