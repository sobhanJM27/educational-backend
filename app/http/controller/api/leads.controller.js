const { StatusCodes: HttpStatus } = require('http-status-codes');
const axios = require('axios');

class ConsultingLeadController {
  async saveRasadLead(first_name, last_name, phone) {
    try {
      const rasadLeadApiUrl = process.env.RASAD_LEAD_API_URL;
      const rasadLeadApiKey = process.env.RASAD_LEAD_API_KEY;
      if (!rasadLeadApiUrl || !rasadLeadApiKey) return;
      await axios.post(
        rasadLeadApiUrl,
        {
          FirstName: first_name || phone,
          last_name: last_name || '-',
          PhoneNumber: phone,
        },
        {
          headers: {
            Authorization: `Bearer ${rasadLeadApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        },
      );
    } catch (error) {
      console.log(
        'rasad lead sync error',
        (error && error.response && error.response.status) || error.message,
      );
    }
  }

  async addConsultingLead(req, res, next) {
    try {
      const { fullName, phone } = req.body;

      if (!fullName || !phone) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'نام و شماره تماس الزامی است',
        });
      }

      const nameParts = fullName.trim().split(/\s+/);
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(' ') || '-';

      await this.saveRasadLead(first_name, last_name, phone);

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'اطلاعات با موفقیت ثبت شد',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  ConsultingLeadController: new ConsultingLeadController(),
};