import { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, DELETE, GET, getInstanceByToken, PATCH, POST } from 'fastify-decorators';
import JobService from '../services/job.service';
import FavoriteService from '../services/favorite.service';
import { addFavoriteJobSchema, createJobSchema, deleteJobSchema, filterSchema, getFavoriteJobSchema, getJobDetailSchema, myJobSchema, updateJobSchema } from './job.schema';
import Security from 'utility-layer/dist/security';
import TokenValidate from 'utility-layer/dist/token';

const security = new Security();
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
      return await this.jobService.addJob(req.body, userIdFromToken);
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
      return await this.jobService.getMyJob(userId, req.query);
    } catch (err) {
      console.log('err :>> ', err);
      throw err;
    }
  }

}

/*
member:
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjk4ZDNiMC01NTQwLTQxYjUtYWQwMi0zZjBlYWNiMGU1N2MiLCJyb2xlcyI6IkFkbWlufERyaXZlciIsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbS9hcC1zb3V0aGVhc3QtMV9oSVdCU1l6N3oiLCJjb2duaXRvOnVzZXJuYW1lIjoiZGI5OGQzYjAtNTU0MC00MWI1LWFkMDItM2YwZWFjYjBlNTdjIiwidXNlcklkIjoiUlpEUlIwS1giLCJjdXN0b206dXNlcklkIjoiUlpEUlIwS1giLCJvcmlnaW5fanRpIjoiNjU3YjA0YTQtOWFkYS00MGZmLThmYTctMWM1ZDUxYTU5ZDM0IiwiYXVkIjoiNHFrZDE0dTZuYTBmbzF0Zmh0cmRhcmk0MWkiLCJldmVudF9pZCI6ImJjODE3MTdhLTBhMjQtNGJhMC1hMzliLWZhOGVlMjczMzkwNyIsInRva2VuX3VzZSI6ImlkIiwianRpIjoiOTM4M2NjMTQtZjI5My00OTRkLTliOTQtM2YwOTYyMjVkMWU3IiwiYXV0aF90aW1lIjoxNjI0NjE5MTQxLCJleHAiOm51bGwsImlhdCI6MTYyNDYxOTE0MX0.quS6HsZgtB9ERCYV1dHAxFhlSLkmWxkr1stpWImwIW6-Sv4rba8jzte-ibI4l7Qp1ApH9qMhAWACn-G6JGsCRA

{
  "truckType": "9",
  "truckAmount": 2,
  "productTypeId": "7",
  "productName": "ทอง",
  "weight": 0.75,
  "price": 1200,
  "tipper": false,
  "priceType": "PER_TRIP",
  "expiredTime": "06-07-2021 16:10:00",
  "from": {
    "name": "1775 ซอย จุฬาฯ 34 แขวง วังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330 ประเทศไทย",
    "dateTime": "09-07-2021 11:00:21",
    "contactName": "Wick",
    "contactMobileNo": "0812223333",
    "lat": "14.056293881885686",
    "lng": "100.02598715946078"
  },
  "to": [
    {
      "name": "95/1 หมู่ 8 อาคารเพ็ญกิจ, ตำบลลำพยา อำเภอเมืองนครปฐม นครปฐม, 73000 ตำบลลำพยา อำเภอเมืองนครปฐม นครปฐม 73000 ประเทศไทย",
      "dateTime": "11-07-2021 18:11:22",
      "contactName": "Cena",
      "contactMobileNo": "0844422222",
      "lat": "13.893544976400875",
      "lng": "99.9737660586834"
    }
  ],
  "platform": 0,
  "userId": "RZDRR0KX"
}

admin:
eyJraWQiOiJKRGJId2JWdlRFZ3M5dVJ4RVY2Y0NBM2dkTW1nU0xKOERhNGxUZmpBaXA4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkYjk4ZDNiMC01NTQwLTQxYjUtYWQwMi0zZjBlYWNiMGU1N2MiLCJyb2xlcyI6IlJPTEVfQURNSU58Uk9MRV9EUklWRVIiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTFfaElXQlNZejd6IiwiY29nbml0bzp1c2VybmFtZSI6ImRiOThkM2IwLTU1NDAtNDFiNS1hZDAyLTNmMGVhY2IwZTU3YyIsImN1c3RvbTp1c2VySWQiOiJFWlFXRzBaMSIsIm9yaWdpbl9qdGkiOiJmYTMxOTAzZC02OTc2LTQwMGMtYjk3NC1lMjllN2JjNjNlZDYiLCJhdWQiOiI0cWtkMTR1Nm5hMGZvMXRmaHRyZGFyaTQxaSIsImV2ZW50X2lkIjoiODE4MDdkZjktYTUyYS00NGQ0LTlmZjgtNDJiOTE0NTkzNGI5IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MjUxMTgwMjMsImV4cCI6MTYyNTEyMTYyMywiaWF0IjoxNjI1MTE4MDIzLCJqdGkiOiJlODY1MmMxYi1kMzJlLTRlMzUtOGJhOC0zNWE2MTNlMTE2ZjkifQ.Hs1Xsdaz1zPlCMUUB3mieBo7L-I3n5Vib0FT_o5fQ882Mn4CcKA66zRLK-2vajp7yzB0H9Ag6Dv5e8S_c7eyG_Qf84ru4A9QA0ybPv6xLPFZbXQoP4KJO16RmJnQlk0ol7PwO9FoISWYktexpo0gS23xAsbIAyVH0lIhjoxhabfOz-0YxLnv2BwhGjOC_m7ibZb4ZI2tlTuDgfrfObOIdZtFYi0GFj2lKhZEKFoiwxUtINQl3KTw2mJBWyH4sfVCrudbIQMxIGbQvh6QNmExVOo7b-muWviN6wC5njeeAizFCLg-_7CnY4wwfd7TqIgtf2Myd8GwdDHncNVJB_nfIg
*/
