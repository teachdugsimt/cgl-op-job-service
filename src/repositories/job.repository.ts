import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { Job } from '../models';
import { FindManyOptions, Repository } from 'typeorm';
import { JobCreateEntity, JobUpdateEntity } from './repository.types';

export default class JobRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: JobCreateEntity): Promise<any> {
    const server: any = this.instance;
    const jobRepository: Repository<Job> = server?.db?.jobs;
    return jobRepository.save(data);
  }

  async findById(id: number): Promise<any> {
    const server: any = this.instance;
    const jobRepository: Repository<Job> = server?.db?.jobs;
    return jobRepository.findOne(id);
  }

  async find(options: FindManyOptions): Promise<any> {
    const server: any = this.instance;
    const jobRepository: Repository<Job> = server?.db?.jobs;
    return jobRepository.find(options);
  }

  async findAndCount(filter: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const jobRepository: Repository<Job> = server?.db?.jobs;
    return jobRepository.findAndCount(filter);
  }

  async update(id: number, data: JobUpdateEntity): Promise<any> {
    const server: any = this.instance
    const jobRepository: Repository<Job> = server?.db?.jobs;

    return jobRepository
      .createQueryBuilder()
      .update<Job>(Job, { ...data, updatedAt: new Date() })
      .where("id = :id", { id: id })
      // .returning(['id', 'email'])
      .updateEntity(true)
      .execute();
  }

  async delete(options: Partial<Job>): Promise<any> {
    const server: any = this.instance
    const jobRepository: Repository<Job> = server?.db?.jobs;
    return jobRepository.delete(options);
  }

}
