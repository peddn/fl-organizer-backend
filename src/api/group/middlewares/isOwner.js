'use strict'

/**
 * `isOwner` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In isOwner middleware. before next')

    await next()
    strapi.log.info('In isOwner middleware. after next')

    console.log(ctx.state.user)
    console.log(ctx.response.body.data)
  }
}
