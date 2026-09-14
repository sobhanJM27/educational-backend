const {
  ConsultingLeadController,
} = require('../../http/controller/api/leads.controller');

const router = require('express').Router();

router.post('/consulting-lead', ConsultingLeadController.addConsultingLead);

module.exports = {
  ApiConsultingLeadRouter: router,
};