const { LeadsController } = require('../../http/controller/api/leads.controller');

const router = require('express').Router();

router.post('/consulting-lead', LeadsController.createConsultingLead);

module.exports = {
    ApiLeadsRouter: router,
}