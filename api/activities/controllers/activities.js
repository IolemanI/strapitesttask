'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    /**
    * Overwrite a create method.
    */
    async create(ctx) {
        let entity;
        try {
            if (ctx.is('multipart')) {
                // This function parses strapi's formData format.
                const { data, files } = parseMultipartData(ctx);
                entity = await strapi.services.activities.create(data, { files });
            } else {
                entity = await strapi.services.activities.create(ctx.request.body);
            }

            // Send an email after activity is created.
            strapi.services.email.send(
                'info@mallorcard.es',
                'Activity has created',
                `Activity "${entity.Title.EN}" has created successfully!`
            );
        } catch (e) {
            console.error(e);
            ctx.status = 500;
            ctx.body = {
                message: e.message || e,
            };
        }

        // This function removes all private fields from the model and its relations.
        return sanitizeEntity(entity, { model: strapi.models.activities });
    },

    /**
    * Update a price for all records.
    * The handler for a custom endpoint '/activities/activities_price'
    */

    updatePrice: async ctx => {
        // Validate Discount field
        if (!ctx.request.body.Discount) {
            ctx.status = 400;
            ctx.body = {
                message: 'Discount field is required.'
            };
            return;
        }

        const { Discount } = ctx.request.body;

        try {
            // Find all activities
            let entities = await strapi.services.activities.find(ctx.query);

            // Caclulate and update discount for every entity
            entities = entities.map(entity => {
                const pricePercent = entity.Price * Discount / 100;
                entity.Price = (entity.Price - pricePercent).toFixed(2);
                return strapi.services.activities.update({ id: entity.id }, entity);
            })

            // Pending a resolved promise
            await Promise.all(entities);
        } catch (e) {
            console.error(e);
            ctx.status = 500;
            ctx.body = {
                message: e.message || e,
            };
        }

        return 'ok';
    },
};
