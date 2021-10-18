import { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, DELETE, GET, getInstanceByToken, PATCH, POST } from 'fastify-decorators';
import JobService from '../services/job.service';
import FavoriteService from '../services/favorite.service';
import {
  addFavoriteJobSchema, createJobSchema, deleteJobSchema,
  filterSchema, finishJobSchema, getFavoriteJobSchema, getJobDetailSchema, getJobSomeoneElseSchema,
  getMasterJobSchema, myJobSchema, updateJobSchema, serachSchema
} from './job.schema';
import Security from 'utility-layer/dist/security';
import Address from 'utility-layer/dist/helper/address';
import TokenValidate from 'utility-layer/dist/token';

const security = new Security();
const address = new Address();
const tokenValidate = new TokenValidate();

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
  async getAll(req: FastifyRequest<{ Headers: { authorization?: string }, Querystring: any }>, reply: FastifyReply): Promise<object> {
    try {
      const { rowsPerPage = 10, page = 1 } = req.query
      const isAdmin = req.headers?.authorization ? tokenValidate.isAdmin(req.headers.authorization) : false
      const jobs = await this.jobService.getAllJob({ ...req.query, isDeleted: isAdmin });
      // console.log('JOBBBB', jobs)
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
      schema: getJobDetailSchema
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
      const userIdFromToken = security.getUserIdByToken(req.headers.authorization);
      const result = await this.jobService.addJob(req.body, userIdFromToken);


      const jobId = security.encodeUserId(result.id)
      const userId = req.body.userId
      const productName = result.productName
      const pickupPoint = address.findProvince(req.body.from.name)
      const deliveryPoint = address.findProvince(req.body.to[0].name)

      const msg_result = await this.jobService.sendNotify(userId, jobId, productName, pickupPoint ?? '-ไม่ระบุต้นทาง-', deliveryPoint ?? '-ไม่ระบุปลายทาง-')
      console.log("MESSAGE RESULT", msg_result)

      return result
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
      return reply.status(204).send();
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
      return reply.status(202).send();
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
      const userIdFromToken = security.getUserIdByToken(token);
      const decodeUserId: string = security.decodeUserId(userIdFromToken);
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
      const userIdFromToken = security.getUserIdByToken(token);
      await this.favoriteService.addOrRemove(jobId, userIdFromToken);
      return reply.status(204).send();
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

  @GET({
    url: '/my-job',
    options: {
      schema: myJobSchema
    }
  })
  async getMyJob(req: FastifyRequest<{
    Headers: { authorization: string }
    Querystring: { descending?: boolean, page?: number, rowsPerPage?: number, sortBy?: string }
  }>, reply: FastifyReply): Promise<object> {
    try {
      const userId = security.getUserIdByToken(req.headers.authorization);
      return await this.jobService.getJobWithUserId(userId, req.query);
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

  @PATCH({
    url: '/:jobId/done',
    options: {
      schema: finishJobSchema
    }
  })
  async finishJobHandler(req: FastifyRequest<{
    Headers: { authorization: string }
    Params: { jobId: string }
    Body: { reason?: string }
  }>, reply: FastifyReply): Promise<object> {
    try {
      const { reason } = req.body
      const userId = security.getUserIdByToken(req.headers.authorization);
      const isAdmin = tokenValidate.isAdmin(req.headers.authorization);
      const options = {
        ...(reason ? { reason } : undefined),
        isAdmin: isAdmin
      }
      await this.jobService.finishJob(userId, req.params.jobId, options);
      return reply.status(204).send({});
    } catch (err) {
      console.log('err :>> ', err);
      if (err.message === 'You do not have permission to access') {
        reply.status(401)
      }
      throw err;
    }
  }

  @GET({
    url: '/:jobId/mst',
    options: {
      schema: getMasterJobSchema
    }
  })
  async findJobMstHandler(req: FastifyRequest<{
    Headers: { authorization: string }
    Params: { jobId: string }
  }>, reply: FastifyReply): Promise<object> {
    try {
      return await this.jobService.findMstJob(req.params.jobId)
    } catch (err) {
      console.log('err :>> ', err);
      reply.status(400);
      throw err;
    }
  }

  @GET({
    url: '/list/user',
    options: {
      schema: getJobSomeoneElseSchema
    }
  })
  async findJobSomeoneElse(req: FastifyRequest<{
    Headers: { authorization: string },
    Querystring: { userId: string, status?: string, page?: number, rowsPerPage?: number, }
  }>, reply: FastifyReply): Promise<object> {
    try {
      const {
        userId,
        page = 1,
        rowsPerPage = 10,
        status = 'NEW'
      } = req.query;

      const filter = {
        ...req.query,
        status: status
      }

      const jobs = await this.jobService.getJobWithUserId(userId, filter);

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
      reply.status(400);
      throw err;
    }
  }


  @GET({
    url: '/search',
    options: {
      schema: serachSchema
    }
  })
  async searchJob(req: FastifyRequest<{ Headers: { authorization?: string }, Querystring: any }>, reply: FastifyReply): Promise<object> {
    try {
      const isAdmin = req.headers?.authorization ? tokenValidate.isAdmin(req.headers.authorization) : false
      const jobs = await this.jobService.findJobListV2({ ...req.query, isDeleted: isAdmin });
      return jobs
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }


}
