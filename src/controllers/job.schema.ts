import { FastifySchema } from 'fastify';

export const filterSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
  },
  querystring: {
    type: 'object',
    properties: {
      descending: { type: 'boolean' },
      from: { type: 'string' },
      maxWeight: { type: 'number' },
      minWeight: { type: 'number' },
      owner: { type: 'string' },
      page: { type: 'number' },
      productName: { type: 'string' },
      productType: { type: 'string' },
      rowsPerPage: { type: 'number' },
      sortBy: { type: 'string' },
      status: { type: 'string' },
      to: { type: 'string' },
      truckAmountMax: { type: 'number' },
      truckAmountMin: { type: 'number' },
      truckType: { type: 'string' },
      type: { type: 'number' },
      weight: { type: 'number' },
      textSearch: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        size: { type: 'number' },
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
        totalElements: { type: 'number' },
        numberOfElements: { type: 'number' },
      },
      additionalProperties: false
    }
  }
}

export const getJobDetailSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    jobId: { type: 'string' }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        productTypeId: { type: 'number' },
        productName: { type: 'string' },
        truckType: { type: 'string' },
        weight: { type: 'number' },
        requiredTruckAmount: { type: 'number' },
        publicAsCgl: { type: 'boolean' },
        from: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            dateTime: { type: 'string' },
            contactName: { type: 'string' },
            contactMobileNo: { type: 'string' },
            lat: { type: 'string' },
            lng: { type: 'string' },
          }
        },
        to: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              dateTime: { type: 'string' },
              contactName: { type: 'string' },
              contactMobileNo: { type: 'string' },
              lat: { type: 'string' },
              lng: { type: 'string' },
            }
          }
        },
        owner: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            fullName: { type: 'string' },
            companyName: { type: 'string' },
            email: { type: 'string' },
            mobileNo: { type: 'string' },
            avatar: {
              type: 'object',
              properties: {
                object: { type: 'string' }
              }
            },
            userId: { type: 'string' }
          }
        },
        status: { type: 'string' },
        price: { type: 'number' },
        priceType: { type: 'string' },
        tipper: { type: 'boolean' },
        trips: {
          type: 'array',
          properties: {}
        },
        quotations: {
          type: 'array',
          properties: {}
        },
      },
      additionalProperties: false
    }
  }
}

export const createJobSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  body: {
    type: 'object',
    properties: {
      truckType: { type: 'string' },
      truckAmount: { type: 'number' },
      productTypeId: { type: 'string' },
      productName: { type: 'string' },
      weight: { type: 'number' },
      price: { type: 'number' },
      tipper: { type: 'boolean' },
      priceType: { type: 'string' },
      expiredTime: { type: 'string' },
      note: { type: 'string' },
      publicAsCgl: { type: 'boolean' },
      from: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          dateTime: { type: 'string' },
          contactName: { type: 'string' },
          contactMobileNo: { type: 'string' },
          lat: { type: 'string' },
          lng: { type: 'string' },
        }
      },
      to: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            dateTime: { type: 'string' },
            contactName: { type: 'string' },
            contactMobileNo: { type: 'string' },
            lat: { type: 'string' },
            lng: { type: 'string' },
          }
        }
      },
      platform: { type: 'number' },
      userId: { type: 'string' },
      family: {
        type: 'object', properties: {
          parent: { type: 'string', nullable: true },
          child: { type: 'array', items: { type: 'string' }, nullable: true }
        }, nullable: true
      }
    },
    additionalProperties: true,
    require: ['truckType', 'productTypeId', 'productName', 'price', 'tipper', 'priceType', 'expiredTime', 'from', 'to']
  },
  response: {
    200: {
      type: 'object',
      properties: {
      },
      additionalProperties: true
    }
  }
}

export const updateJobSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    jobId: { type: 'string' }
  },
  body: {
    type: 'object',
    properties: {
      truckType: { type: 'string' },
      truckAmount: { type: 'number' },
      productTypeId: { type: 'string' },
      productName: { type: 'string' },
      weight: { type: 'number' },
      price: { type: 'number' },
      tipper: { type: 'boolean' },
      priceType: { type: 'string' },
      expiredTime: { type: 'string' },
      note: { type: 'string' },
      publicAsCgl: { type: 'boolean' },
      from: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          dateTime: { type: 'string' },
          contactName: { type: 'string' },
          contactMobileNo: { type: 'string' },
          lat: { type: 'string' },
          lng: { type: 'string' },
        }
      },
      to: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            dateTime: { type: 'string' },
            contactName: { type: 'string' },
            contactMobileNo: { type: 'string' },
            lat: { type: 'string' },
            lng: { type: 'string' },
          }
        }
      },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
      },
      additionalProperties: true
    }
  }
}

export const deleteJobSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    jobId: { type: 'string' }
  },
  response: {
    200: {
      type: 'object',
      properties: {
      },
      additionalProperties: true
    }
  }
}

export const getFavoriteJobSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  querystring: {
    type: 'object',
    properties: {
      descending: { type: 'boolean' },
      page: { type: 'number' },
      rowsPerPage: { type: 'number' },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
      },
      additionalProperties: true
    }
  }
}


export const addFavoriteJobSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  body: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
      },
      additionalProperties: true
    },
    // 204: {
    //   type: 'object',
    //   properties: {
    //   },
    //   additionalProperties: true
    // }
  },
}

export const myJobSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  querystring: {
    type: 'object',
    properties: {
      descending: { type: 'boolean' },
      page: { type: 'number' },
      rowsPerPage: { type: 'number' },
      sortBy: { type: 'string' },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        size: { type: 'number' },
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
        totalElements: { type: 'number' },
        numberOfElements: { type: 'number' },
      },
      additionalProperties: false
    }
  }
}

export const finishJobSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    jobId: { type: 'string' }
  },
  body: {
    type: 'object',
    properties: {
      reason: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
      },
      additionalProperties: true
    }
  }
}

export const getMasterJobSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
  },
  params: {
    jobId: { type: 'string' }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        truckType: { type: 'string' },
        truckAmount: { type: 'number' },
        productTypeId: { type: 'string' },
        productName: { type: 'string' },
        weight: { type: 'number' },
        price: { type: 'number' },
        tipper: { type: 'boolean' },
        priceType: { type: 'string' },
        expiredTime: { type: 'string' },
        note: { type: 'string' },
      },
      additionalProperties: true
    }
  }
}

export const getJobSomeoneElseSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
  },
  querystring: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      descending: { type: 'boolean' },
      page: { type: 'number' },
      rowsPerPage: { type: 'number' },
      status: {
        type: 'string',
        enum: ['NEW', 'INPROGRESS', 'DONE']
      },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        size: { type: 'number' },
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
        totalElements: { type: 'number' },
        numberOfElements: { type: 'number' },
      },
      additionalProperties: true
    }
  }
}


export const serachSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
  },
  querystring: {
    type: 'object',
    properties: {
      descending: { type: 'boolean' },
      page: { type: 'number' },
      rowsPerPage: { type: 'number' },
      sortBy: { type: 'string' },
      searchText: { type: 'string' },
    },
    additionalProperties: true
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        size: { type: 'number' },
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
        totalElements: { type: 'number' },
        numberOfElements: { type: 'number' },
      },
      additionalProperties: false
    }
  }
}

export const pushJobNotify: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
  },
  params: {
    jobId: { type: 'string' }
  },
  response: {
    200: {
      type: 'boolean',
      additionalProperties: false
    }
  }
}
