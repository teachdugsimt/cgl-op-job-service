import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { Job } from '../models';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { JobCreateEntity, JobUpdateEntity } from './repository.types';

type JobStatusProps = 'NEW' | 'INPROGRESS' | 'CANCELLED' | 'DONE' | 'EXPIRED'
export default class JobRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: JobCreateEntity): Promise<any> {
    const server: any = this.instance;
    const jobRepository: Repository<Job> = server?.db?.jobs;
    return jobRepository.save(data);
  }

  async findById(id: number, opts?: FindOneOptions): Promise<any> {
    const server: any = this.instance;
    const jobRepository: Repository<Job> = server?.db?.jobs;
    return jobRepository.findOne(id, opts);
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

  async update(id: number, data: Partial<Job>): Promise<any> {
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

  async addFullTextSearch(id: number, texts: Array<string>): Promise<any> {
    const server: any = this.instance
    const jobRepository: Repository<Job> = server?.db?.jobs;
    return jobRepository.query(
      `UPDATE job
      SET full_text_search = (
        setweight(to_tsvector('english', COALESCE($2, '')), 'A')
        || setweight(to_tsvector('english', COALESCE($3, '')), 'B')
        || setweight(to_tsvector('english', COALESCE($4, '')), 'C')
        || setweight(to_tsvector('english', COALESCE($5, '')), 'D')
      )
      WHERE id = $1`,
      [id, ...texts]
    )
  }

  async updateTripStatusByJobId(jobId: number, status: JobStatusProps): Promise<any> {
    const server: any = this.instance
    const jobRepository: Repository<Job> = server?.db?.jobs;
    return jobRepository.query(
      `SELECT * FROM dblink('bookserver'::text, FORMAT('UPDATE trip t SET status = %L FROM job_carrier jc WHERE t.job_carrier_id = jc.id AND jc.job_id = %L;', '${status}', ${jobId})::TEXT) jsv (updated TEXT)`
    );
  }

}
