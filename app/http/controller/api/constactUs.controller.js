const { StatusCodes: HttpStatus } = require('http-status-codes');
const { ContactModel } = require('../../../model/contaxtUs.model');
const createHttpError = require('http-errors');
const MelipayamakApi = require('melipayamak');
const Controller = require('../controller');
var axios = require('axios');
class ContactController extends Controller {
  async add(req, res, next) {
    try {
      const { name, phone, text, subject, time } = req.body;
      if (text) {
        await ContactModel.create({ name, phone, text, subject, time });
        await this.savedidar(name, phone);
        //await this.sendAdviceSms(name, phone, time)
        return res.status(HttpStatus.OK).json({ StatusCode: HttpStatus.OK });
      }
      await ContactModel.create({ name, phone, time });
      //await this.sendAdviceSms(name, phone, time)
      await this.savedidar(name, phone);
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
  // async sendAdviceSms(name, phone, time) {
  //     const username = '09307886969';
  //     const password = 'FL2$Q';
  //     const api = new MelipayamakApi(username, password);
  //     const smsRest = api.sms()
  //     const to = "09330042028";
  //     let hourRange;
  //     if(time == "morning"){
  //         hourRange = "9-14"
  //     }
  //     if(time == "evening"){
  //         hourRange = "16-21"
  //     }
  //     const text = `${name};${phone};${hourRange}`
  //     smsRest.sendByBaseNumber(text, to, 176368).then(e => {
  //         console.log(e)
  //     }).catch(err => {
  //         console.log("err" + err)
  //     })
  // }
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
  async savedidar(name, phone) {
    let data = JSON.stringify({
      Contact: {
        //"FirstName": name,
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
            Title: 'ثبت نام در سایت',
            ParentId: '34a77bbd-7fc2-4f46-a2d7-4d5f2f644a1e',
            ParentTitle: 'سایت',
            BackgroundColor: '#1eff00',
            FullTitle: 'سایت / ثبت نام در سایت',
          },
        ],
      },
    });
    var config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: 'https://app.didar.me/api/contact/save?ApiKey=73hhtymnab402euorpo08309if5eeob2',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}

module.exports = {
  ContactController: new ContactController(),
};
