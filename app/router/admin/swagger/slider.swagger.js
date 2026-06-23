/**
 * @swagger
 *  components:
 *      schemas:
 *        Slider:
 *              type: object
 *              required:
 *                  -   images

 *              properties:
 *                  images:
 *                      type: array
 *                      items:
 *                          type: string
 */

/**
 * @swagger
 *  /admin/slider/add:
 *      post:
 *          tags: [Slider(AdminPanel)]
 *          summary: add slider
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          $ref: '#/components/schemas/Slider'
 *
 *          responses:
 *              201:
 *                  description: created new slider
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/definitions/publicDefinition'
 *
 */

/**
 * @swagger
 *  /admin/slider/delete/{id}:
 *      delete:
 *          tags: [Slider(AdminPanel)]
 *          summary: delete One event
 *          parameters:
 *              -   in: path
 *                  name: id
 *                  type: string
 *                  description: objectId of images
 *          responses:
 *              200:
 *                  description: success
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/definitions/publicDefinition'
 */
/**
 * @swagger
 *  /admin/slider/list:
 *      get:
 *          tags: [Slider(AdminPanel)]
 *          summary: get all slider
 *          responses:
 *              200:
 *                  description: success
 */
