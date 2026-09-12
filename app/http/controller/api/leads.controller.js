const { StatusCodes: HttpStatus } = require('http-status-codes');

class LeadsController {
  async createConsultingLead(req, res, next) {
    console.log('🟢 [1] وارد کنترلر شد | body:', req.body);
    try {
      const { fullName, phoneNumber } = req.body;

      if (!fullName || !phoneNumber) {
        console.log('🔴 [2] نام یا شماره خالیه', { fullName, phoneNumber });
        return res.status(400).json({
          statusCode: 400,
          message: 'نام و شماره تماس الزامی است',
        });
      }

      const formId = process.env.MYRASAD_FORM_ID;
      const apiKey = process.env.MYRASAD_API_KEY;
      console.log('🟢 [3] env check:', {
        formId,
        apiKeyExists: !!apiKey,
        apiKeyPreview: apiKey ? apiKey.slice(0, 10) + '...' : null,
      });

      if (!formId || !apiKey) {
        console.log('🔴 [4] env ناقصه');
        return res.status(500).json({
          statusCode: 500,
          message: 'تنظیمات اتصال به رصد کامل نیست',
          error: !formId ? 'MYRASAD_FORM_ID تنظیم نشده است' : 'MYRASAD_API_KEY تنظیم نشده است',
        });
      }

      const url = `https://myrasad.com/api/public/forms/akademizarei/${formId}/leads`;
      console.log('🟢 [5] درخواست به myrasad:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          FullName: fullName,
          PhoneNumber: phoneNumber,
        }),
      });

      console.log('🟢 [6] پاسخ myrasad | status:', response.status);

      const responseText = await response.text();
      console.log('🟢 [7] بدنه پاسخ myrasad:', responseText);

      if (!response.ok) {
        let message = 'خطا در ارتباط با رصد';
        switch (response.status) {
          case 400: message = 'اطلاعات ارسال‌شده صحیح نیست'; break;
          case 401: message = 'API Key نامعتبر است یا ارسال نشده'; break;
          case 403: message = 'دسترسی به این فرم مجاز نیست'; break;
          case 404: message = 'فرم یا آدرس API پیدا نشد'; break;
          case 422: message = 'اطلاعات فرم مورد قبول نیست'; break;
          case 429: message = 'تعداد درخواست‌ها بیش از حد مجاز است'; break;
          case 500: message = 'خطای داخلی در سرور رصد'; break;
        }
        console.log('🔴 [8] myrasad خطا داد:', response.status, message);
        return res.status(response.status).json({
          statusCode: response.status,
          message,
          error: responseText,
        });
      }

      let data = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      console.log('🟢 [9] موفقیت‌آمیز بود');
      return res.status(200).json({
        statusCode: 200,
        message: 'درخواست شما با موفقیت ثبت شد',
        data,
      });
    } catch (error) {
      console.error('🔴 [ERR] createConsultingLead crash:', error.message, error.stack);
      return res.status(500).json({
        statusCode: 500,
        message: 'خطا در اتصال به سرویس رصد',
        error: error.message,
      });
    }
  }
}

module.exports = {
  LeadsController: new LeadsController(),
};