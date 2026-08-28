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

const Controller = require('../controller');
const request = require('request');
const username = process.env.MELIPAYAMAK_USERNAME;
const password = process.env.MELIPAYAMAK_PASSWORD;
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
      const adminPhones = process.env.ADMIN_PHONES.split(',');

      if (adminPhones.includes(findUser.phone)) {
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
      const username = process.env.MELIPAYAMAK_USERNAME;
      const password = process.env.MELIPAYAMAK_PASSWORD;
      const api = new MelipayamakApi(username, password);
      const smsRest = api.sms();
      const to = '' + phone;
      // const from = '50004001886969';
      const text = `${code}`;
      //const bodyid = "کد ورود یکبار مصرف شما {0} میباشد"
      smsRest
        .sendByBaseNumber(text, to, process.env.MELIPAYAMAK_OTP_BODY_ID)
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

  async savedidar(first_name, last_name, phone) {
    let data = JSON.stringify({
      Contact: {
        FirstName: first_name,
        LastName: last_name,
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
            Title: 'ثبت نام در سایت',
            ParentId: process.env.DIDAR_SEGMENT_PARENT_ID,
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
      url: `https://app.didar.me/api/contact/save?ApiKey=${process.env.DIDAR_REGISTER_API_KEY}`,
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
        PersonId: process.env.DIDAR_PERSON_ID,
        CompanyId: process.env.DIDAR_COMPANY_ID,
        FirstName: first_name,
        LastName: last_name,
        MobilePhone: phone,
        Title: 'معامله hdajhv',
        PipelineStageId: process.env.DIDAR_PIPELINE_STAGE_ID,
        OwnerId: process.env.DIDAR_OWNER_ID,
        SegmentIds: [],
        VisibilityType: 'OwnerGroup',
      },
    });
    var config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: `localhost:4300/api/deal/save?apikey=${DIDAR_API_KEY}`,
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
