require('dotenv').config()
import { Service, Initializer, Destructor } from 'fastify-decorators';
import { Between, FindManyOptions, ILike, Like, In, MoreThan } from 'typeorm';
import JobRepository from "../repositories/job.repository";
import VwJobListRepository from '../repositories/vw-job-list.repository';
import JobListV2Repository from '../repositories/vw-job-list-v2.repository'
import ShipmentRepository from '../repositories/shipment.repository';
import * as Types from './job.type'
import date from 'date-and-time';
import Utility from 'utility-layer/dist/security';
import Token from 'utility-layer/dist/token';
import lodash from 'lodash';
import { URL } from 'url'
import fetch from 'node-fetch'
import moment from 'moment-timezone'
import axios from 'axios'

interface JobFindEntity {
  descending?: boolean
  from?: string
  maxWeight?: number
  minWeight?: number
  owner?: string
  page?: number
  productName?: string
  productType?: string
  rowsPerPage?: number
  sortBy?: string
  status?: number | string
  to?: string
  truckAmountMax?: number
  truckAmountMin?: number
  truckType?: string
  type?: number
  weight?: number
  isDeleted?: boolean
  textSearch?: string
  includeExpireJob?: boolean
}

interface family {
  parent: string | null
  child: string[] | null
}

interface AddJobEntity {
  truckType: string
  truckAmount: number
  productTypeId: string
  productName: string
  weight: string
  price: string
  tipper: boolean
  priceType: string
  expiredTime: string
  note?: string
  publicAsCgl?: boolean,
  from: {
    name: string
    dateTime: string
    contactName: string
    contactMobileNo: string
    lat: string
    lng: string
  },
  to: {
    name: string
    dateTime: string
    contactName: string
    contactMobileNo: string
    lat: string
    lng: string
  }[],
  platform?: number
  userId?: string
  family?: {
    parent: string | null
    child: string[] | null
  }
}

interface ShipmentDestination {
  id: number
  addressDest: string
  deliveryDatetime: string
  fullnameDest: string
  phoneDest: string
  latitudeDest: string
  longitudeDest: string
}

interface OptionalFinishJobProps {
  reason?: string
  isAdmin?: boolean
}

type FindMyJobEntity = Omit<JobFindEntity, 'from' | 'maxWeight' | 'minWeight' | 'owner' | 'productName' | 'productType' | 'to' | 'truckAmountMax' | 'truckAmountMin' | 'truckType' | 'type' | 'weight' | 'isDeleted' | 'textSearch'>

enum JobStatus {
  NEW = 'NEW'
}

enum Platform {
  PC = 0,
  MOBILE = 1
}

const jobRepository = new JobRepository();
const viewJobRepositry = new VwJobListRepository();
const viewJobV2Repository = new JobListV2Repository();
const shipmentRepository = new ShipmentRepository();
const utility = new Utility();
const token = new Token();

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

@Service()
export default class JobService {

  public dateFormat: string = 'DD-MM-YYYY HH:mm'
  public dateFormatWithMs: string = 'DD-MM-YYYY HH:mm:ss'
  public dateFormatStandard: string = 'YYYY-MM-DD HH:mm:ss'

  @Initializer()
  async init(): Promise<void> { }

  private convertFormatDate(dt: string) {
    if (date.isValid(dt, this.dateFormatStandard)) {
      return new Date(dt);
    } else {
      return new Date(date.parse(dt, this.dateFormatWithMs))
    }
  }

  async getAllJob(filter: JobFindEntity): Promise<any> {
    let {
      descending = true,
      from,
      maxWeight,
      minWeight,
      owner,
      page,
      productName,
      productType,
      rowsPerPage,
      sortBy = 'id',
      status,
      to,
      truckAmountMax,
      truckAmountMin,
      truckType,
      type,
      weight,
      isDeleted = false,
      textSearch,
      includeExpireJob = false
    } = filter

    let jobs: any
    let filterTotalWeight: any = {}
    let filterTruckAmount: any = {}
    let conditionForMobileSearch: any = {}
    let conditionForFullTextSearch: any = []

    let numbOfPage: number;
    let numbOfLimit: number;
    if (rowsPerPage) {
      numbOfLimit = +rowsPerPage;
    } else {
      numbOfLimit = 10;
    }
    if (page) {
      numbOfPage = +page === 1 ? 0 : (+page - 1) * numbOfLimit;
    } else {
      numbOfPage = 0;
    }

    console.log("includeExpireJob : ", includeExpireJob)
    console.log("IsDelete :: ", isDeleted)
    const newDate = moment((new Date())).format("YYYY-MM-DD HH:mm:ss")
    if (textSearch) {
      console.log("New date :: ", newDate)
      const filterOptions: string = includeExpireJob == true ? '' : `("VwJobList"."loading_datetime" >= '${newDate}' and "VwJobList"."status" = '${status || 'NEW'}') and `
      const options = {
        fullTextSearch: `${textSearch}:*`,
        page: numbOfPage,
        rowsPerPage: numbOfLimit,
        ...(sortBy ? { sortBy: camelToSnakeCase(sortBy) } : undefined),
        ...(descending ? { descending: descending ? 'DESC' : 'ASC' } : undefined),
      }
      jobs = await viewJobRepositry.fullTextSearch(options, filterOptions);
    } else {
      if (maxWeight && minWeight) {
        filterTotalWeight.totalWeight = [minWeight, maxWeight];
      } else if (maxWeight) {
        filterTotalWeight.totalWeight = [0, maxWeight];
      } else if (minWeight) {
        filterTotalWeight.totalWeight = [minWeight, 999999];
      }

      if (truckAmountMax && truckAmountMin) {
        filterTruckAmount.truckAmount = [truckAmountMin, truckAmountMax];
      } else if (truckAmountMax) {
        filterTruckAmount.truckAmount = [0, truckAmountMax];
      } else if (truckAmountMin) {
        filterTruckAmount.truckAmount = [truckAmountMin, 999999];
      }

      conditionForMobileSearch = {
        ...(from ? { address: from } : undefined),
        // ...(to ? {}),
        ...filterTotalWeight,
        // ...(owner ? {}),
        ...(productName ? { productName } : undefined),
        ...(productType?.length ? { productTypeId: JSON.parse(productType) } : undefined),
        ...filterTruckAmount,
        ...(truckType?.length ? { truckType: JSON.parse(truckType) } : undefined),
        ...(status ? { status } : includeExpireJob == false ? { status: 'NEW' } : undefined),
        ...(includeExpireJob == false ? { loadingDatetime: newDate } : undefined),
        ...(isDeleted ? undefined : { isDeleted: false }), // Remove this attribute when user is admin
      }

      const options: FindManyOptions = {
        where: conditionForMobileSearch,
        take: numbOfLimit,
        skip: numbOfPage,
        order: {
          [camelToSnakeCase(sortBy)]: descending ? 'DESC' : 'ASC'
        },
      }

      jobs = await viewJobRepositry.findAndCountV2(options)
    }

    const jobMapping = jobs[0]?.map((job: any) => {
      // console.log('JOB', job)
      return {
        id: utility.encodeUserId(job.id),
        productTypeId: job.productTypeId,
        productName: job.productName,
        truckType: job.truckType,
        weight: Math.round(job.weight * 100) / 100,
        requiredTruckAmount: job.requiredTruckAmount,
        from: {
          name: job.loadingAddress,
          dateTime: job.loadingDatetime && date.isValid(job.loadingDatetime) ? date.format(new Date(job.loadingDatetime), this.dateFormat) : null,
          contactName: job.loadingContactName,
          contactMobileNo: job.loadingContactPhone,
          lat: job.loadingLatitude.toString(),
          lng: job.loadingLongitude.toString(),
        },
        to: job.shipments?.map((shipment: any) => ({
          ...shipment,
          dateTime: shipment.dateTime && date.format(new Date(shipment.dateTime), this.dateFormat)
        })),
        owner: {
          ...job.owner,
          userId: utility.encodeUserId(job.owner.id),
          companyName: job.owner.fullName
        },
        status: job.status,
        // quotations: [],
        price: Math.round(job.price * 100) / 100,
        priceType: job.priceType,
        tipper: job.tipper,
        publicAsCgl: job.publicAsCgl,
        createdAt: job.createdAt
      }
    })

    // console.log('JOB MAPPING', jobMapping)

    return {
      data: jobMapping || [],
      count: jobs[1] || 0,
    }
  }

  async getJobDetail(jobId: string): Promise<any> {
    const id = utility.decodeUserId(jobId);
    const job = await viewJobRepositry.findById(id);

    if (job.quotations?.length) {
      job.quotations = job.quotations.map((quotation: any) => {
        return {
          ...quotation,
          id: utility.encodeUserId(quotation.id),
          truck: {
            // ...quotation.truck,
            id: utility.encodeUserId(quotation.truck.id),
            owner: {
              ...(quotation?.truck?.owner?.id ? {
                ...quotation.truck.owner,
                userId: utility.encodeUserId(quotation.truck.owner.id),
                companyName: quotation.truck.owner.fullName
              } : {})
            },
            tipper: quotation.truck?.tipper,
            workingZones: quotation.truck?.work_zone,
            createdAt: quotation.truck?.created_at && date.format(new Date(quotation.truck?.created_at), this.dateFormat),
            updatedAt: quotation.truck?.updated_at && date.format(new Date(quotation.truck?.updated_at), this.dateFormat),
            truckType: quotation.truck?.truck_type,
            stallHeight: quotation.truck?.stall_height,
            truckPhotos: quotation.truck?.truck_photos,
            approveStatus: quotation.truck?.approve_status,
            loadingWeight: quotation.truck?.loading_weight,
            registrationNumber: quotation.truck?.registration_number,
            phoneNumber: quotation.truck?.owner?.mobileNo ?? null
          },
          bookingDatetime: date.format(new Date(job.loadingDatetime), this.dateFormat)
        }
      });
    }

    if (job.trips?.length) {
      job.trips = job.trips.map((trip: any) => {
        return {
          ...trip,
          id: utility.encodeUserId(trip.id),
          bookingId: utility.encodeUserId(trip.bookingId),
          truckId: utility.encodeUserId(trip.truckId),
          owner: {
            ...(trip?.owner?.id ? {
              ...trip.owner,
              userId: utility.encodeUserId(trip.owner.id),
              companyName: trip.owner.fullName
            } : {})
          }
        }
      })
    }

    return {
      id: utility.encodeUserId(job.id),
      productTypeId: job.productTypeId,
      productName: job.productName,
      truckType: job.truckType,
      weight: Math.round(job.weight * 100) / 100,
      requiredTruckAmount: job.requiredTruckAmount,
      from: {
        name: job.loadingAddress,
        dateTime: date.format(new Date(job.loadingDatetime), this.dateFormat),
        contactName: job.loadingContactName,
        contactMobileNo: job.loadingContactPhone,
        lat: job.loadingLatitude.toString(),
        lng: job.loadingLongitude.toString(),
      },
      to: job.shipments?.map((shipment: any) => ({
        ...shipment,
        dateTime: shipment.dateTime ? date.format(new Date(shipment.dateTime), this.dateFormat) : null
      })),
      owner: {
        ...job.owner,
        userId: utility.encodeUserId(job.owner.id),
        companyName: job.owner.fullName
      },
      status: job.status,
      price: Math.round(job.price * 100) / 100,
      priceType: job.priceType,
      tipper: job.tipper,
      publicAsCgl: job.publicAsCgl,
      trips: job?.trips ?? [],
      quotations: job?.quotations ?? [],
    }
  }

  processFammily(fam: family | null) {
    if (!fam) return null

    const tmpFamily: any = JSON.parse(JSON.stringify(fam))
    if (tmpFamily?.parent) {
      tmpFamily['parent'] = utility.decodeUserId(tmpFamily['parent'])
    }
    if (tmpFamily?.child && Array.isArray(tmpFamily.child)) {
      tmpFamily.child = fam.child?.map((e: any) => {
        return utility.decodeUserId(e)
      })
    }
    console.log("Data family :: ", tmpFamily)
    return tmpFamily
  }

  async addJob(data: AddJobEntity, userId: string): Promise<any> {
    const decodeUserId = utility.decodeUserId(userId);
    const userIdFromMember = data?.userId ? utility.decodeUserId(data.userId) : null;
    let destinationData: string = '';

    const jobParams = {
      status: JobStatus.NEW,
      offeredTotal: data.price,
      createdUser: decodeUserId,
      updatedUser: decodeUserId,
      userId: userIdFromMember ?? decodeUserId,
      truckType: data.truckType,
      truckAmount: data.truckAmount,
      productTypeId: +data.productTypeId,
      productName: data.productName,
      totalWeight: data.weight,
      tipper: data.tipper,
      priceType: data.priceType,
      // validUntil: data.expiredTime,
      validUntil: new Date(date.parse(data.expiredTime, this.dateFormatWithMs)),
      handlingInstruction: data.note,
      loadingAddress: data.from.name,
      // loadingDatetime: data.from.dateTime,
      loadingDatetime: new Date(date.parse(data.from.dateTime, this.dateFormatWithMs)),
      loadingContactName: data.from.contactName,
      loadingContactPhone: data.from.contactMobileNo,
      loadingLatitude: +data.from.lat,
      loadingLongitude: +data.from.lng,
      platform: data.platform ?? Platform.MOBILE,
      publicAsCgl: data?.publicAsCgl ?? false,
      family: data?.family ? this.processFammily(data.family) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const jobResult = await jobRepository.add(jobParams);
    if (data?.family && data.family?.parent) {
      const decodeParentId = utility.decodeUserId(data.family.parent)
      const getParent = await jobRepository.findById(decodeParentId);
      getParent.family = {
        parent: null, child: getParent?.family?.child ? [...getParent.family.child, +jobResult.id] : [+jobResult.id]
      }
      getParent.id = utility.decodeUserId(getParent.id)
      console.log("Get parent data :: ", getParent)
      await jobRepository.update(getParent.id, getParent)
    }

    console.log("jobResult :: ", jobResult)
    const shipmentParams = data.to.map((shipment: any) => {
      destinationData += `${shipment.name} ${shipment.contactName} ${shipment.contactMobileNo} `;
      return {
        jobId: jobResult.id,
        status: JobStatus.NEW,
        addressDest: shipment.name,
        // deliveryDatetime: shipment.dateTime,
        deliveryDatetime: new Date(date.parse(shipment.dateTime, this.dateFormatWithMs)),
        fullnameDest: shipment.contactName,
        phoneDest: shipment.contactMobileNo,
        latitudeDest: +shipment.lat,
        longitudeDest: +shipment.lng,
        createdUser: decodeUserId,
        updatedUser: decodeUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const loadingData = `${jobParams.loadingAddress} ${jobParams.loadingContactName} ${jobParams.loadingContactPhone}`;

    await shipmentRepository.bulkInsert(shipmentParams);
    const ownerData = await viewJobRepositry.findById(jobResult.id, { select: ['owner'] });

    await jobRepository.addFullTextSearch(jobResult.id, [
      jobParams.productName,
      ownerData?.owner?.fullName ?? '',
      loadingData,
      destinationData
    ]);

    return jobResult;
  }

  async updateDetail(jobId: string, data: Partial<AddJobEntity>, token: string): Promise<any> {
    const userIdFromToken = utility.getUserIdByToken(token);
    const decodeUserId: number = utility.decodeUserId(userIdFromToken);
    const decodeJobId: number = utility.decodeUserId(jobId);

    const jobParams = {
      offeredTotal: data?.price,
      updatedUser: decodeUserId.toString(),
      truckType: data?.truckType,
      truckAmount: data?.truckAmount,
      productTypeId: data?.productTypeId ? +data.productTypeId : undefined,
      productName: data?.productName,
      totalWeight: data?.weight,
      tipper: data?.tipper,
      publicAsCgl: data?.publicAsCgl,
      priceType: data?.priceType,
      validUntil: data?.expiredTime ? this.convertFormatDate(data.expiredTime) : undefined,
      handlingInstruction: data.note,
      loadingAddress: data?.from?.name,
      loadingDatetime: data?.from?.dateTime ? this.convertFormatDate(data.from.dateTime) : undefined,
      loadingContactName: data?.from?.contactName,
      loadingContactPhone: data?.from?.contactMobileNo,
      loadingLatitude: data?.from?.lat ? +data.from.lat : undefined,
      loadingLongitude: data?.from?.lng ? +data.from.lng : undefined,
    }

    const jobRemoveUndefinedParmas = JSON.parse(JSON.stringify(jobParams));
    console.log('jobRemoveUndefinedParmas :>> ', jobRemoveUndefinedParmas);
    const jobUpdated = await jobRepository.update(decodeJobId, jobRemoveUndefinedParmas);

    if (data?.to?.length) {
      console.log('JSON.stringify(data.to) :>> ', JSON.stringify(data.to));
      const shipments: ShipmentDestination[] = await shipmentRepository.find({
        where: { jobId: decodeJobId },
        select: [
          'id', 'addressDest', 'deliveryDatetime', 'fullnameDest', 'phoneDest', 'latitudeDest', 'longitudeDest',
        ]
      });

      console.log('JSON.stringify(shipments) :>> ', JSON.stringify(shipments));

      const shipmentForDelete = lodash.differenceWith(
        shipments,
        data.to,
        (a, b) => lodash.isEqual(a.phoneDest, b.contactMobileNo) &&
          lodash.isEqual(a.fullnameDest, b.contactName) &&
          lodash.isEqual(
            date.format(new Date(a.deliveryDatetime), this.dateFormat),
            date.format(this.convertFormatDate(b.dateTime), this.dateFormat)
          ) &&
          lodash.isEqual(a.addressDest, b.name) &&
          lodash.isEqual(a.latitudeDest.toString(), b.lat) &&
          lodash.isEqual(a.longitudeDest.toString(), b.lng)
      );

      const shipmentForAdd = lodash.differenceWith(
        data.to,
        shipments,
        (a, b) =>
          lodash.isEqual(a.contactMobileNo, b.phoneDest) &&
          lodash.isEqual(a.contactName, b.fullnameDest) &&
          lodash.isEqual(
            date.format(this.convertFormatDate(a.dateTime), this.dateFormat),
            date.format(new Date(b.deliveryDatetime), this.dateFormat)
          ) &&
          lodash.isEqual(a.name, b.addressDest) &&
          lodash.isEqual(a.lat, b.latitudeDest.toString()) &&
          lodash.isEqual(a.lng, b.longitudeDest.toString())
      );

      if (shipmentForAdd.length) {
        console.log('JSON.stringify(shipmentForAdd) :>> ', JSON.stringify(shipmentForAdd));
        const shipmentParams = shipmentForAdd.map((shipment) => ({
          jobId: decodeJobId,
          status: JobStatus.NEW,
          addressDest: shipment.name,
          deliveryDatetime: this.convertFormatDate(shipment.dateTime),
          fullnameDest: shipment.contactName,
          phoneDest: shipment.contactMobileNo,
          latitudeDest: +shipment.lat,
          longitudeDest: +shipment.lng,
          createdUser: decodeUserId.toString(),
          updatedUser: decodeUserId.toString()
        }))
        console.log('JSON.stringify(shipmentParams) :>> ', JSON.stringify(shipmentParams));
        await shipmentRepository.bulkInsert(shipmentParams);
      }

      if (shipmentForDelete.length) {
        console.log('JSON.stringify(shipmentForDelete) :>> ', JSON.stringify(shipmentForDelete));
        const shipmentIds = shipmentForDelete.map(({ id }) => id);
        await shipmentRepository.delete({ id: In(shipmentIds) })
      }
    }

    return jobUpdated;
  }

  async deactivateJob(jobId: string, token: string): Promise<any> {
    const decodeJobId: number = utility.decodeUserId(jobId);
    const userIdFromToken = utility.getUserIdByToken(token);
    const decodeUserId: number = utility.decodeUserId(userIdFromToken);

    const params = { isDeleted: true, updatedUser: decodeUserId.toString() }
    await jobRepository.update(decodeJobId, params);
    await shipmentRepository.updateByJobId(decodeJobId, params)

    return true;
  }

  async getJobWithUserId(userId: string, filter: FindMyJobEntity): Promise<any> {
    let {
      descending = true,
      page = 1,
      rowsPerPage = 10,
      sortBy = 'id',
      status
    } = filter

    const decodeUserId = utility.decodeUserId(userId);

    let numbOfPage: number;
    let numbOfLimit: number;
    if (rowsPerPage) {
      numbOfLimit = +rowsPerPage;
    } else {
      numbOfLimit = 10;
    }
    if (page) {
      numbOfPage = +page === 1 ? 0 : (+page - 1) * numbOfLimit;
    } else {
      numbOfPage = 0;
    }

    const options: FindManyOptions = {
      where: {
        userId: decodeUserId,
        ...(status ? { status } : undefined)
      },
      take: numbOfLimit,
      skip: numbOfPage,
      order: {
        [sortBy]: descending ? 'DESC' : 'ASC'
      },
    }

    const jobs = await viewJobRepositry.findAndCount(options)

    const jobMapping = jobs[0]?.map((job: any) => {
      return {
        id: utility.encodeUserId(job.id),
        productTypeId: job.productTypeId,
        productName: job.productName,
        truckType: job.truckType,
        weight: Math.round(job.weight * 100) / 100,
        requiredTruckAmount: job.truckAmount,
        from: {
          name: job.loadingAddress,
          dateTime: date.isValid(job.loadingDatetime) ? date.format(new Date(job.loadingDatetime), this.dateFormat) : null,
          contactName: job.loadingContactName,
          contactMobileNo: job.loadingContactPhone,
          lat: job.loadingLatitude.toString(),
          lng: job.loadingLongitude.toString(),
        },
        to: job.shipments?.map((shipment: any) => ({
          ...shipment,
          dateTime: date.format(new Date(shipment.dateTime), this.dateFormat)
        })),
        owner: {
          ...job.owner,
          userId: utility.encodeUserId(job.owner.id),
          companyName: job.owner.fullName
        },
        status: job.status,
        // quotations: job?.quotations ?? [],
        price: Math.round(job.price * 100) / 100,
        priceType: job.priceType,
        tipper: job.tipper,
        publicAsCgl: job.publicAsCgl,
      }
    })

    return {
      data: jobMapping || [],
      count: jobs[1] || 0,
    }
  }

  async finishJob(userId: string, jobId: string, optional?: OptionalFinishJobProps): Promise<any> {
    const decodeUserId = utility.decodeUserId(userId);
    const decodeJobId = utility.decodeUserId(jobId);
    const reason = optional?.reason
    const isAdmin = optional?.isAdmin

    let jobOption: any = {}
    if (!isAdmin) jobOption.where = { userId: decodeUserId }
    const jobStatus: any = reason && reason === 'CANCELJOB' ? 'CANCELLED' : 'DONE'
    const dataForUpdateJob = {
      status: jobStatus,
      userId: decodeUserId,
      ...(reason ? { reason } : undefined),
    }
    const vwJobData = await viewJobRepositry.findById(decodeJobId, jobOption);

    if (vwJobData) {
      if (vwJobData?.trips) {
        await jobRepository.updateTripStatusByJobId(decodeJobId, jobStatus);
      }
      return jobRepository.update(decodeJobId, dataForUpdateJob);
    }
    throw new Error('You do not have permission to access');
  }

  async findMstJob(jobId: string): Promise<any> {
    const decodeJobId = utility.decodeUserId(jobId);
    const job = await jobRepository.findById(decodeJobId, {
      select: ['id', 'offeredTotal', 'priceType', 'productName', 'productTypeId', 'truckAmount', 'status', 'tipper', 'truckType', 'totalWeight']
    });

    return {
      id: jobId,
      productTypeId: job.productTypeId,
      productName: job.productName,
      truckType: job.truckType,
      weight: Math.round(job.totalWeight * 100) / 100,
      requiredTruckAmount: job.truckAmount,
      status: job.status,
      price: Math.round(job.offeredTotal * 100) / 100,
      priceType: job.priceType,
      publicAsCgl: job.publicAsCgl,
      tipper: job.tipper
    }
  }

  async processLoadingPoint(list: Types.SearchResult[]) {
    if (!list || !Array.isArray(list)) return []

    const tmpList: Types.SearchResult[] = JSON.parse(JSON.stringify(list))
    tmpList.map((e: Types.SearchResult, i: number) => {
      let slot: any = e
      slot.from = {
        name: e.loadingAddress,
        dateTime: e.loadingDatetime,
        contactName: e.loadingContactName,
        contactMobileNo: e.loadingContactPhone,
        lat: e.loadingLatitude,
        lng: e.loadingLongitude,
      }
      slot.to = e.shipments

      delete slot.shipments
      delete slot.loadingAddress
      delete slot.loadingDatetime
      delete slot.loadingContactName
      delete slot.loadingContactPhone
      delete slot.loadingLatitude
      delete slot.loadingLongitude
    })
    return tmpList
  }

  async findJobListV2(query: Types.JobListFilter) {
    console.log("Query service :: ", JSON.stringify(query))
    let { rowsPerPage = 10, page = 1, descending = true, sortBy = 'id', searchText, where } = query;

    let realPage: number;
    let realTake: number;
    if (rowsPerPage) realTake = +rowsPerPage;
    else {
      rowsPerPage = 10;
      realTake = 10;
    }
    if (page) realPage = +page === 1 ? 0 : (+page - 1) * realTake;
    else {
      realPage = 0;
      page = 1;
    }

    let response: any

    if (searchText) {
      const options = {
        fullTextSearch: `${searchText}:*`,
        page: realPage,
        rowsPerPage: realTake,
        ...(sortBy ? { sortBy: camelToSnakeCase(sortBy) } : undefined),
        ...(descending ? { descending: descending ? 'DESC' : 'ASC' } : undefined),
      }
      response = await viewJobV2Repository.fullTextSearch(options);
    } else {
      const filter: any = where && typeof where == 'string' ? JSON.parse(where) : (where ?? {})
      if (filter?.id) filter.id = utility.decodeUserId(filter.id)
      if (filter?.loadingDatetime) filter.loadingDatetime = MoreThan(filter.loadingDatetime)
      const findOptions: FindManyOptions = {
        take: realTake,
        skip: realPage,
        where: filter,
        order: {
          [camelToSnakeCase(sortBy)]: descending ? 'DESC' : 'ASC'
        },
      };
      response = await viewJobV2Repository.findAndCount(findOptions)
    }

    const parseResponse: any = await this.processLoadingPoint(response[0])
    console.log("Parseresponse :: ", parseResponse)
    const response_final = {
      data: parseResponse || [],
      totalElements: response[1] || 0,
      size: rowsPerPage,
      numberOfElements: response[0].length ?? 0,
      currentPage: page,
      totalPages: Math.ceil((response[1] || 0) / (+rowsPerPage))
    }
    console.log("Response get job list :: ", response_final)
    return response_final
  }

  async sendNotify(userId: string, jobId: string, productName: string,
    pickupPoint: string, deliveryPoint: string): Promise<any> {

    const messaging_host = process.env.API_HOST || 'https://dev.api.cargolink.co.th'
    const url = new URL('api/v1/messaging/notification/new-job', messaging_host)


    const result = await fetch(url.href, {
      headers: {
        "Content-Type": "application/json"
      },
      method: 'POST',
      body: JSON.stringify({
        userId: userId,
        jobData: {
          jobId: jobId,
          productType: "",
          productName: productName,
          pickupPoint: pickupPoint,
          deliveryPoint: deliveryPoint
        }
      })
    })

    return result
  }

  async sendLineNotify(jobId: string): Promise<any> {
    const messaging_host = process.env.API_HOST || 'https://dev.api.cargolink.co.th'
    const url = new URL('api/v1/messaging/line/boardcast', messaging_host)
    console.log("URL host :: ", url)
    // const result = await fetch(url.href, {
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   method: 'POST',
    //   body: JSON.stringify({
    //     jobId
    //   })
    // })
    const result = await axios.post(url.href, { jobId })

    return result
  }

  @Destructor()
  async destroy(): Promise<void> { }
}

/*

{
  "note": "Hello world !!",
  "to": [
    {
      "name": "???????????????????????????????????????-????????????????????? ???????????? ?????????????????? ??????????????????????????????????????????????????? ????????????????????? 26000 ???????????????????????????",
      "dateTime": "01-06-2021 09:12:33",
      "contactName": "Fun",
      "contactMobileNo": "0900011111",
      "lat": "14.240156708205872",
      "lng": "101.2658803537488"
    },
    {
      "name": "????????????????????? ???????????????????????????????????? ?????????????????? ???????????????????????????",
      "dateTime": "03-07-2021 16:12:33",
      "contactName": "Um",
      "contactMobileNo": "0988880000",
      "lat": "13.173935",
      "lng": "100.9203128"
    },
    {
      "name": "22/1 ???????????? 1, ?????????????????????????????? ??????????????????????????????????????? ??????????????????????????????, 63000 ???????????? ?????????????????? ??????????????????????????????????????? ????????? 63000 ???????????????????????????",
      "dateTime": "06-07-2021 13:09:10",
      "contactName": "Tum",
      "contactMobileNo": "0877777777",
      "lat": "16.910912068420917",
      "lng": "99.12378491833806"
    }
  ]
}

4ZM80EZ0

eyJraWQiOiJKRGJId2JWdlRFZ3M5dVJ4RVY2Y0NBM2dkTW1nU0xKOERhNGxUZmpBaXA4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkYjk4ZDNiMC01NTQwLTQxYjUtYWQwMi0zZjBlYWNiMGU1N2MiLCJyb2xlcyI6IkFkbWlufERyaXZlciIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aGVhc3QtMV9oSVdCU1l6N3oiLCJjb2duaXRvOnVzZXJuYW1lIjoiZGI5OGQzYjAtNTU0MC00MWI1LWFkMDItM2YwZWFjYjBlNTdjIiwidXNlcklkIjoiRVpRV0cwWjEiLCJjdXN0b206dXNlcklkIjoiRVpRV0cwWjEiLCJvcmlnaW5fanRpIjoiNjU3YjA0YTQtOWFkYS00MGZmLThmYTctMWM1ZDUxYTU5ZDM0IiwiYXVkIjoiNHFrZDE0dTZuYTBmbzF0Zmh0cmRhcmk0MWkiLCJldmVudF9pZCI6ImJjODE3MTdhLTBhMjQtNGJhMC1hMzliLWZhOGVlMjczMzkwNyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjI0NDcwNDQzLCJleHAiOjE2MjQ0NzQwNDMsImlhdCI6MTYyNDQ3MDQ0MywianRpIjoiOTM4M2NjMTQtZjI5My00OTRkLTliOTQtM2YwOTYyMjVkMWU3In0.iqFKygQQPXzDk1Yz0ZAwhp0V5eGM5GYqPmIHgP3gQHQpGw88rWO_2CmelPlK6_u0HX43lrMVwP-DB8mEOR-IV2WzgueP0xUl-d4dGtExCpyZd_fsiJjOUzpaR02_5MetN6qe0h6xb4ax78APMVBXDcx3Ep-QbxTeQM4xny6iuCgA8MrsZ8QRbvOdX7wZR5WDwtHKYA4ppA06hryGA0UzG6hAcG46_VGJcEjaV_It51R6vzAfohz367-vBtmUqLAcePeKGDIscAEKvgQXOlXi3_NT7KI9TW3zJc-5FxNt1XrC2rR-hTF91qQhtILZLYipb843AvxMKtP1j98cZXN8fQ

*/
