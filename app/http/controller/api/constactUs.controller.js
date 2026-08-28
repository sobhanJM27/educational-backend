const { StatusCodes: HttpStatus } = require('http-status-codes');
const { ContactModel } = require('../../../model/contactUs.model');
const createHttpError = require('http-errors');
const MelipayamakApi = require('melipayamak');
const Controller = require('../controller');
var axios = require('axios');

class ContactController extends Controller {
  async add(req, res, next) {
    try {
      const { name, phone, text, subject, time } = req.body;
      let contactDoc;
      if (text) {
        contactDoc = await ContactModel.create({
          name,
          phone,
          text,
          subject,
          time,
        });
      } else {
        contactDoc = await ContactModel.create({ name, phone, time });
      }
      const personResult = await this.savedidar(name, phone);
      const personId = this.extractPersonId(personResult);

      if (!personId) {
        console.error(
          '[Didar] Could not extract personId from savedidar response:',
          JSON.stringify(personResult),
        );
        await ContactModel.updateOne(
          { _id: contactDoc._id },
          { $set: { didarDealError: 'personId not found in Didar response' } },
        ).catch(() => {});
      } else {
        await ContactModel.updateOne(
          { _id: contactDoc._id },
          { $set: { didarPersonId: personId } },
        ).catch(() => {});

        const dealResult = await this.savedidardeal(personId, name, phone);
        const dealId = dealResult?.Id || dealResult?.Response?.Id || null;

        if (dealId) {
          await ContactModel.updateOne(
            { _id: contactDoc._id },
            { $set: { didarDealId: dealId } },
          ).catch(() => {});
        } else {
          await ContactModel.updateOne(
            { _id: contactDoc._id },
            {
              $set: {
                didarDealError: 'deal/save did not return a usable response',
              },
            },
          ).catch(() => {});
        }
      }

      return res.status(HttpStatus.OK).json({ StatusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const getAllContact = await ContactModel.find({});
      return res.status(HttpStatus.OK).json({
        StatusCode: HttpStatus.OK,
        getAllContact,
      });
    } catch (error) {
      next(error);
    }
  }

  async status(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ContactModel.findOneAndUpdate(
        { _id: id },
        { $set: { status: true } },
      );
      if (result.modifiedCount == 0)
        throw createHttpError.InternalServerError(
          'سرور با مشکل مواجه شده است دوباره تلاش کنید',
        );
      await this.sendStatusSms(result.phone, result.name);
      return res.status(HttpStatus.OK).json({
        StatusCode: HttpStatus.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendStatusSms(phone, name) {
    const username = process.env.MELIPAYAMAK_USERNAME;
    const password = process.env.MELIPAYAMAK_PASSWORD;
    const api = new MelipayamakApi(username, password);
    const smsRest = api.sms();
    const to = '' + phone;
    const text = `${name}`;
    smsRest
      .sendByBaseNumber(text, to, process.env.MELIPAYAMAK_STATUS_BODY_ID)
      .then((e) => {
        console.log(e);
      })
      .catch((err) => {
        console.log('err' + err);
      });
  }

  async savedidar(name, phone) {
    try {
      const response = await axios.post(
        `https://app.didar.me/api/contact/save?apikey=${process.env.DIDAR_API_KEY}`,
        {
          Contact: {
            LastName: name,
            MobilePhone: phone,
            ProvinceId: process.env.DIDAR_PROVINCE_ID,
            CityId: process.env.DIDAR_CITY_ID,
            Fields: {
              Field_996_12_8: 'Test',
              Field_996_12_9: 'Test',
            },
            Segments: [
              {
                Id: process.env.DIDAR_SEGMENT_ID,
              },
            ],
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(
        '[Didar] contact/save response:',
        JSON.stringify(response.data),
      );

      return response.data;
    } catch (error) {
      console.error(
        '[Didar] contact/save failed:',
        error.response?.data || error.message,
      );
      // return null instead of throwing so the contact form submission
      // (already saved to our own DB) doesn't fail for the end user
      return null;
    }
  }

  extractPersonId(personResult) {
    if (!personResult) return null;
    return (
      personResult.Id ||
      personResult.Response?.Id ||
      personResult.Response?.Contact?.Id ||
      personResult.Contact?.Id ||
      null
    );
  }

  async savedidardeal(personId, name, phone) {
    try {
      if (!personId) {
        console.error(
          '[Didar] savedidardeal called without a personId, aborting.',
        );
        return null;
      }

      const response = await axios.post(
        `https://app.didar.me/api/deal/save?apikey=${process.env.DIDAR_API_KEY}`,
        {
          Deal: {
            PersonId: personId,
            Title: 'ثبت نام دوره مدیریت استرس',
            PipelineStageId: process.env.DIDAR_PIPELINE_STAGE_ID,
            OwnerId: process.env.DIDAR_OWNER_ID,
            SegmentIds: [],
            VisibilityType: 'OwnerGroup',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('[Didar] deal/save response:', JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error(
        '[Didar] deal/save failed:',
        error.response?.data || error.message,
      );
      return null;
    }
  }
}

module.exports = {
  ContactController: new ContactController(),
};
