const createHttpError = require('http-errors');
const { UserModel } = require('../../../model/user.model');
const {
  signJWT,
  VerifyRefreshToken,
  SignRefreshToken,
} = require('../../middleware/JWT');
const { StatusCodes } = require('http-status-codes');
const MelipayamakApi = require('melipayamak');

var axios = require('axios');
// app.didar.me/api/contact/save?apikey= badfc503-2033-4e84-9289-a25b6a792862
const Controller = require('../controller');
const request = require('request');
const username = '09307886969';
const password = 'FL2$Q';
const api = new MelipayamakApi(username, password);

class AuthController extends Controller {
  async checkUser(req, res, next) {
    try {
      const { phone } = req.body;
      const findUser = await UserModel.findOne({ phone });
      if (findUser) {
        const code = this.generateCode();
        await UserModel.updateOne({ phone }, { $set: { 'otp.code': code } });
        this.sendSMS(phone, code);
        return res
          .status(StatusCodes.OK)
          .json({ message: 'کاربر یافت شد', StatusCode: StatusCodes.OK });
      } else {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'کاربر یافت نشد',
          StatusCode: StatusCodes.NOT_FOUND,
        });
      }
    } catch (error) {
      next(error);
    }
  }
  async register(req, res, next) {
    try {
      const { first_name, last_name, phone } = req.body;
      const findUser = await this.findUser(phone);
      if (findUser)
        throw createHttpError.Unauthorized('شما قبلا ثبت نام کرده ایید');
      const code = Math.floor(Math.random() * 100000);
      const otp = {
        code,
        expiresIn: new Date().getTime() + 120000,
      };
      // await this.savedidar(first_name, last_name, phone);
      // await this.savedidardeal(first_name, last_name, phone);

      const creatUser = await UserModel.create({
        first_name,
        last_name,
        phone,
        otp,
      });
      if (!creatUser) throw createHttpError.InternalServerError('');
      this.sendSMS(phone, code);
      await this.saveRasadLead(first_name, last_name, phone);
      return res.status(StatusCodes.CREATED).json({
        StatusCode: StatusCodes.CREATED,
        message: 'شما با موفقیت ثبت نام شدید',
      });
    } catch (error) {
      next(error);
    }
  }
  async loginForOtp(req, res, next) {
    try {
      const { code, phone } = req.body;
      let Role = 'USER';
      const findUser = await this.findUser(phone);
      const validtionCode = await this.validtionCode(phone, code);
      if (validtionCode == false)
        throw createHttpError.Unauthorized('کد ارسال شده صحیح نمیباشد');
      const token = await signJWT(findUser._id);
      const refreshTOken = await SignRefreshToken(findUser._id);
      await findUser.updateOne({ $set: { token } });
      if (
        findUser.phone == '09178116652' ||
        findUser.phone == '09307886969' ||
        findUser.phone == '09179300277' ||
        findUser.phone == '09395356683' ||
        findUser.phone == '09035134830'
      ) {
        Role = 'ADMIN';
        await UserModel.updateOne(
          { _id: findUser._id },
          { $set: { role: 'ADMIN' } },
        );
      }
      return res.status(StatusCodes.OK).json({
        StatusCode: StatusCodes.OK,
        token,
        refreshTOken,
        message: 'ورود شما موفقیت آمیز بود',
        Role,
        findUser,
      });
    } catch (error) {
      next(error);
    }
  }
  async refreshToken(req, res, next) {
    try {
      const { refreshtoken } = req.body;
      const verfiRefreshToken = await VerifyRefreshToken(refreshtoken);
      const findUser = await UserModel.findOne({ phone: verfiRefreshToken });
      const singToken = await signJWT(findUser._id);
      findUser.token = singToken;
      findUser.save();
      let Role = 'USER';
      if (
        findUser.phone == '09178116652' ||
        findUser.phone == '09307886969' ||
        findUser.phone == '09395356683' ||
        findUser.phone == '09179300277'
      ) {
        Role = 'ADMIN';
        await UserModel.updateOne(
          { _id: findUser._id },
          { $set: { role: 'ADMIN' } },
        );
      }
      return res.status(StatusCodes.OK).json({
        singToken,
        Role,
        findUser,
      });
    } catch (error) {
      next(error);
    }
  }
  async validtionCode(phone, code) {
    const findUser = await this.findUser(phone);
    if (!findUser) throw createHttpError.NotFound('کاربری یافت نشد');
    // console.log(code);
    // console.log(findUser.otp.code);
    if (+code != +findUser.otp.code) return false;
    return true;
  }
  async findUser(phone) {
    const findUser = await UserModel.findOne({ phone });
    return findUser;
  }
  async refreshCode(req, res, next) {
    try {
      const { phone } = req.body;
      const code = this.generateCode();
      this.sendSMS(phone, code);
      return res.status(StatusCodes.OK).json({
        message: 'کد ارسال شد',
      });
    } catch (error) {
      next(error);
    }
  }
  async sendSMS(phone, code) {
    try {
      const username = '09307886969';
      const password = 'FL2$Q';
      const api = new MelipayamakApi(username, password);
      const smsRest = api.sms();
      const to = '' + phone;
      const from = '50004001886969';
      const text = `${code}`;
      //const bodyid = "کد ورود یکبار مصرف شما {0} میباشد"
      smsRest
        .sendByBaseNumber(text, to, 175205)
        .then((e) => {
          console.log(e);
        })
        .catch((err) => {
          console.log('err' + err);
        });
    } catch (error) {
      next(error);
    }
  }

  async saveRasadLead(first_name, last_name, phone) {
    try {
      const rasadLeadApiUrl =
        process.env.RASAD_AUTH_LEAD_API_URL ||
        'https://myrasad.com/api/public/forms/akademizarei/8/leads';
      const rasadLeadApiKey =
        process.env.RASAD_AUTH_LEAD_API_KEY || 'rasad_form_pae1XIZf0KYRhGbaRbAp_IbdvdRIgBe3JN08rYzD5QI';

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
        'rasad lead sync error (auth)',
        (error && error.response && error.response.status) || error.message,
      );
    }
  }

  async savedidar(first_name, last_name, phone) {
    let data = JSON.stringify({
      Contact: {
        FirstName: first_name,
        LastName: last_name,
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
        // console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  async savedidardeal() {
    let data = JSON.stringify({
      Deal: {
        PersonId: '200a5df0-488d-4dae-81b3-b1dec904fa2b',
        CompanyId: '853F80AB-10A5-49E1-BD08-AFEC09E6054F',
        FirstName: first_name,
        LastName: last_name,
        MobilePhone: phone,
        Title: 'معامله hdajhv',
        PipelineStageId: 'b4a7c2a4-a0b4-4aa1-af40-bf5138b17a9d',
        OwnerId: 'f677929c-0f9a-4570-8234-c5b6ac20b892',
        SegmentIds: [],
        VisibilityType: 'OwnerGroup',
      },
    });
    var config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: 'localhost:4300/api/deal/save?apikey=t2eaeztl755nxumkpue7o8lwyuij7gc6',
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

  generateCode() {
    return Math.floor(Math.random() * 10000);
  }
}

module.exports = {
  AuthController: new AuthController(),
};
