import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { VwFavoriteJob } from '../models';
import { FindManyOptions, Repository } from 'typeorm';

export default class VwFavoriteJobRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async findById(id: number): Promise<any> {
    const server: any = this.instance;
    const viewFavoriteJob: Repository<VwFavoriteJob> = server?.db?.vwFavoriteJob;
    return viewFavoriteJob.findOne(id);
  }

  async find(options: FindManyOptions): Promise<any> {
    const server: any = this.instance;
    const viewFavoriteJob: Repository<VwFavoriteJob> = server?.db?.vwFavoriteJob;
    return viewFavoriteJob.find(options);
  }

  async findAndCount(filter: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const viewFavoriteJob: Repository<VwFavoriteJob> = server?.db?.vwFavoriteJob;
    return viewFavoriteJob.findAndCount(filter);
  }

}
