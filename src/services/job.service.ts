import { Service, Initializer, Destructor } from 'fastify-decorators';
import { Between, FindManyOptions, ILike, In } from 'typeorm';
import JobRepository from "../repositories/job.repository";
import VwJobListRepository from '../repositories/vw-job-list.repository';
import ShipmentRepository from '../repositories/shipment.repository';
import date from 'date-and-time';
import Utility from 'utility-layer/dist/security';
import lodash from 'lodash';

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
  status?: number
  to?: string
  truckAmountMax?: number
  truckAmountMin?: number
  truckType?: string
  type?: number
  weight?: number
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

enum JobStatus {
  ACTIVE = 1
}

enum Platform {
  PC = 0,
  MOBILE = 1
}

const jobRepository = new JobRepository();
const viewJobRepositry = new VwJobListRepository();
const shipmentRepository = new ShipmentRepository();
const utility = new Utility();

@Service()
export default class JobService {

  public dateFormat: string = 'DD-MM-YYYY HH:mm'
  public dateFormatWithMs: string = 'DD-MM-YYYY HH:mm:ss'

  @Initializer()
  async init(): Promise<void> { }

  async getAllJob(filter: JobFindEntity): Promise<any> {
    let {
      descending,
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
    } = filter

    let filterTotalWeight: any = {}
    let filterTruckAmount: any = {}

    if (maxWeight && minWeight) {
      filterTotalWeight.totalWeight = Between(minWeight, maxWeight);
    } else if (maxWeight) {
      filterTotalWeight.totalWeight = Between(0, maxWeight);
    } else if (minWeight) {
      filterTotalWeight.totalWeight = Between(minWeight, 999999);
    }

    if (truckAmountMax && truckAmountMin) {
      filterTruckAmount.truckAmount = Between(truckAmountMin, truckAmountMax);
    } else if (truckAmountMax) {
      filterTruckAmount.truckAmount = Between(0, truckAmountMax);
    } else if (truckAmountMin) {
      filterTruckAmount.truckAmount = Between(truckAmountMin, 999999);
    }

    const cond = {
      ...(from ? { loadingAddress: ILike(`%${from}%`) } : undefined),
      // ...(to ? {}),
      ...filterTotalWeight,
      // ...(owner ? {}),
      ...(productName ? { productName } : undefined),
      ...(productType ? { productTypeId: In(JSON.parse(productType)) } : undefined),
      ...filterTruckAmount,
      ...(truckType ? { truckType: In(JSON.parse(truckType)) } : undefined),
      ...(status ? { status } : undefined),
      isDeleted: false // Remove this attribute when user is admin
    }

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
      where: cond,
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
          userId: utility.encodeUserId(job.owner.id)
        },
        status: job.status,
        quotations: [],
        price: Math.round(job.price * 100) / 100,
        priceType: job.priceType,
        tipper: job.tipper
      }
    })

    return {
      data: jobMapping || [],
      count: jobs[1] || 0,
    }
  }

  async getJobDetail(jobId: string): Promise<any> {
    const id = utility.decodeUserId(jobId);
    const job = await viewJobRepositry.findById(id);

    return {
      id: utility.encodeUserId(job.id),
      productTypeId: job.productTypeId,
      productName: job.productName,
      truckType: job.truckType,
      weight: Math.round(job.weight * 100) / 100,
      requiredTruckAmount: job.truckAmount,
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
        userId: utility.encodeUserId(job.owner.id)
      },
      status: job.status,
      quotations: [],
      price: Math.round(job.price * 100) / 100,
      priceType: job.priceType,
      tipper: job.tipper
    }
  }

  async addJob(data: AddJobEntity, token: string): Promise<any> {
    const userId = utility.getUserIdByToken(token);
    const decodeUserId = utility.decodeUserId(userId);

    const jobParams = {
      status: JobStatus.ACTIVE,
      offeredTotal: data.price,
      createdUser: decodeUserId,
      updatedUser: decodeUserId,
      userId: decodeUserId,
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
      platform: data.platform ?? Platform.MOBILE
    }

    const jobResult = await jobRepository.add(jobParams);

    const shipmentParams = data.to.map((shipment: any) => ({
      jobId: jobResult.id,
      status: JobStatus.ACTIVE,
      addressDest: shipment.name,
      // deliveryDatetime: shipment.dateTime,
      deliveryDatetime: new Date(date.parse(shipment.dateTime, this.dateFormatWithMs)),
      fullnameDest: shipment.contactName,
      phoneDest: shipment.contactMobileNo,
      latitudeDest: +shipment.lat,
      longitudeDest: +shipment.lng,
      createdUser: decodeUserId,
      updatedUser: decodeUserId,
    }))

    await shipmentRepository.bulkInsert(shipmentParams);

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
      priceType: data?.priceType,
      validUntil: data?.expiredTime ? new Date(date.parse(data.expiredTime, this.dateFormatWithMs)) : undefined,
      handlingInstruction: data.note,
      loadingAddress: data?.from?.name,
      loadingDatetime: data?.from?.dateTime ? new Date(date.parse(data.from.dateTime, this.dateFormatWithMs)) : undefined,
      loadingContactName: data?.from?.contactName,
      loadingContactPhone: data?.from?.contactMobileNo,
      loadingLatitude: data?.from?.lat ? +data.from.lat : undefined,
      loadingLongitude: data?.from?.lng ? +data.from.lng : undefined,
    }

    const jobRemoveUndefinedParmas = JSON.parse(JSON.stringify(jobParams));
    const jobUpdated = await jobRepository.update(decodeJobId, jobRemoveUndefinedParmas);

    if (data?.to?.length) {

      const shipments: ShipmentDestination[] = await shipmentRepository.find({
        where: { jobId: decodeJobId },
        select: [
          'id', 'addressDest', 'deliveryDatetime', 'fullnameDest', 'phoneDest', 'latitudeDest', 'longitudeDest',
        ]
      });

      const shipmentForDelete = lodash.differenceWith(
        shipments,
        data.to,
        (a, b) =>
          lodash.isEqual(a.phoneDest, b.contactMobileNo) &&
          lodash.isEqual(a.fullnameDest, b.contactName) &&
          lodash.isEqual(date.format(new Date(a.deliveryDatetime), this.dateFormatWithMs), b.dateTime) &&
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
          lodash.isEqual(a.dateTime, date.format(new Date(b.deliveryDatetime), this.dateFormatWithMs)) &&
          lodash.isEqual(a.name, b.addressDest) &&
          lodash.isEqual(a.lat, b.latitudeDest.toString()) &&
          lodash.isEqual(a.lng, b.longitudeDest.toString())
      );

      if (shipmentForDelete.length) {
        console.log('JSON.stringify(shipmentForDelete) :>> ', JSON.stringify(shipmentForDelete));
        const shipmentIds = shipmentForDelete.map(({ id }) => id);
        await shipmentRepository.delete({ id: In(shipmentIds) })
      }

      if (shipmentForAdd.length) {
        console.log('JSON.stringify(shipmentForAdd) :>> ', JSON.stringify(shipmentForAdd));
        const shipmentParams = shipmentForAdd.map((shipment) => ({
          jobId: decodeJobId,
          status: JobStatus.ACTIVE,
          addressDest: shipment.name,
          deliveryDatetime: new Date(date.parse(shipment.dateTime, this.dateFormatWithMs)),
          fullnameDest: shipment.contactName,
          phoneDest: shipment.contactMobileNo,
          latitudeDest: +shipment.lat,
          longitudeDest: +shipment.lng,
          createdUser: decodeUserId.toString(),
          updatedUser: decodeUserId.toString(),
        }))

        await shipmentRepository.bulkInsert(shipmentParams);
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

  @Destructor()
  async destroy(): Promise<void> { }
}

/*

{
  "note": "Hello world !!",
  "to": [
    {
      "name": "ถนนเขาทุเรียน-เขาน้อย ตำบล เขาพระ อำเภอเมืองนครนายก นครนายก 26000 ประเทศไทย",
      "dateTime": "01-06-2021 09:12:33",
      "contactName": "Fun",
      "contactMobileNo": "0900011111",
      "lat": "14.240156708205872",
      "lng": "101.2658803537488"
    },
    {
      "name": "เกาะลอย อำเภอศรีราชา ชลบุรี ประเทศไทย",
      "dateTime": "03-07-2021 16:12:33",
      "contactName": "Um",
      "contactMobileNo": "0988880000",
      "lat": "13.173935",
      "lng": "100.9203128"
    },
    {
      "name": "22/1 หมู่ 1, ตำบลไม้งาม อำเภอเมืองตาก จังหวัดตาก, 63000 ตำบล ไม้งาม อำเภอเมืองตาก ตาก 63000 ประเทศไทย",
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