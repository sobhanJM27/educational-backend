const { StatusCodes: HttpStatus } = require('http-status-codes');

class LeadsController {
  async createConsultingLead(req, res, next) {
    try {
      const { fullName, phoneNumber } = req.body;

      if (!fullName || !phoneNumber) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'نام و شماره تماس الزامی است',
        });
      }

      const formId = process.env.MYRASAD_FORM_ID;
      const apiKey = process.env.MYRASAD_API_KEY;

      const response = await fetch(
        `https://myrasad.com/api/public/forms/akademizarei/${formId}/leads`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            FullName: fullName,
            PhoneNumber: phoneNumber,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`myrasad error: ${response.status} - ${errText}`);
      }

      const data = await response.json();

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'درخواست شما با موفقیت ثبت شد',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  LeadsController: new LeadsController(),
};