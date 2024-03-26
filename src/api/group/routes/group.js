'use strict'

/**
 * group router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('api::group.group', {
  config: {
    find: {
      middlewares: ['api::group.is-owner'],
    },
  },
})
