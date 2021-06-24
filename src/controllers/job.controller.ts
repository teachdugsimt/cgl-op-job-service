import { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, DELETE, GET, getInstanceByToken, PATCH, POST } from 'fastify-decorators';
import JobService from '../services/job.service';
import { createJobSchema, deleteJobSchema, filterSchema, getJobDetail, updateJobSchema } from './job.schema';

@Controller({ route: '/api/v1/jobs' })
export default class JobController {

  private jobService = getInstanceByToken<JobService>(JobService);

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
      return await this.jobService.updateDetail(jobId, data, token);
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
      return await this.jobService.deactivateJob(jobId, token);
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

}
