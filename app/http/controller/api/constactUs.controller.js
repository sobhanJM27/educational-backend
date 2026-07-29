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

      // 1) always save the raw contact request first (unchanged behavior),
      // keeping a reference to the created doc so later updates target
      // this exact submission (not just any doc matching name+phone).
      let contactDoc;
      if (text) {
        contactDoc = await ContactModel.create({ name, phone, text, subject, time });
      } else {
        contactDoc = await ContactModel.create({ name, phone, time });
      }

      // 2) create/save the person in Didar
      const personResult = await this.savedidar(name, phone);
      const personId = this.extractPersonId(personResult);

      if (!personId) {
        // We couldn't figure out the person's Id from Didar's response.
        // Don't silently continue - log loudly so it shows up in server logs/monitoring,
        // and mark the contact record so you can spot it without needing to check logs.
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

        // 3) only now create the deal, using the real personId
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
            { $set: { didarDealError: 'deal/save did not return a usable response' } },
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
    const username = '09307886969';
    const password = 'FL2$Q';
    const api = new MelipayamakApi(username, password);
    const smsRest = api.sms();
    const to = '' + phone;
    const text = `${name}`;
    smsRest
      .sendByBaseNumber(text, to, 176593)
      .then((e) => {
        console.log(e);
      })
      .catch((err) => {
        console.log('err' + err);
      });
  }

  /**
   * Creates/updates a person (contact) in Didar and returns the raw response body.
   */
  async savedidar(name, phone) {
    try {
      const response = await axios.post(
        'https://app.didar.me/api/contact/save?apikey=t2eaeztl755nxumkpue7o8lwyuij7gc6',
        {
          Contact: {
            LastName: name,
            MobilePhone: phone,
            ProvinceId: 'c990e86b-a13a-40f4-b21d-79bf09e6e579',
            CityId: '00000000-0000-0000-0000-000000000000',
            Fields: {
              Field_996_12_8: 'Test',
              Field_996_12_9: 'Test',
            },
            Segments: [
              {
                Id: '0acb04ef-3d20-4b05-872f-0233da4fabd7',
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

      console.log('[Didar] contact/save response:', JSON.stringify(response.data));

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

  /**
   * Didar's response shape for contact/save isn't 100% guaranteed from the code
   * alone (it can vary by API version / config), so we defensively try every
   * shape we've seen documented or in this codebase:
   *   { Id: "..." }
   *   { Response: { Id: "..." } }
   *   { Response: { Contact: { Id: "..." } } }
   *   { Contact: { Id: "..." } }
   */
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

  /**
   * Creates a deal in Didar for an already-created person (personId).
   */
  async savedidardeal(personId, name, phone) {
    try {
      if (!personId) {
        console.error('[Didar] savedidardeal called without a personId, aborting.');
        return null;
      }

      const response = await axios.post(
        'https://app.didar.me/api/deal/save?apikey=t2eaeztl755nxumkpue7o8lwyuij7gc6',
        {
          Deal: {
            PersonId: personId,
            Title: 'ثبت نام دوره مدیریت استرس',
            PipelineStageId: 'b4a7c2a4-a0b4-4aa1-af40-bf5138b17a9d',
            OwnerId: 'f677929c-0f9a-4570-8234-c5b6ac20b892',
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
