const createHttpError = require('http-errors');
const { UserModel } = require('../../../model/user.model');
const { StatusCodes } = require('http-status-codes');
const { SaleModel } = require('../../../model/sale.model');
const { CouresModel } = require('../../../model/course.model');
const { BookModel } = require('../../../model/book.model');
const {
  copyObject,
  deleteInvalidPropertyInObject,
} = require('../../../module/function');
const Controller = require('../controller');
const { SpotPlayerController } = require('./spotplayer.controller');
const { PaymentModel } = require('../../../model/payments');
const { SpotPlayerModel } = require('../../../model/spotplayer.model');

const blackListFields = {
  PHONE: 'phone',
  FIRST_NAME: 'first_name',
  LAST_NAME: 'last_name',
  CITY: 'city',
  CODEPOSTAL: 'codePostal',
  PROVICE: 'provice',
  FIXPHONE: 'fixPhone',
};
Object.freeze(blackListFields);

class UserController extends Controller {
  async getProfileUSer(req, res, next) {
    try {
      const reqUser = req.user;
      const findUser = await UserModel.findOne({ _id: reqUser._id });
      if (!findUser)
        throw createHttpError.NotFound(
          'کاربری یافت نشد وارد حساب کاربری خود شوید',
        );
      let user = copyObject(findUser);
      const sale = await SaleModel.find({ userID: reqUser._id });
      let date;
      let numberCourseOnline = 0;
      let numberCourseOfline = 0;
      let numberCourseInPersone = 0;
      let numberBook = 0;
      let numberComment = 0;
      let factor;
      const book = await BookModel.find({ 'comments.userID': reqUser._id });
      const course = await CouresModel.find({ 'comments.userID': reqUser._id });
      const blog = await BookModel.find({ 'comments.userID': reqUser._id });
      let token;
      book.forEach((e) => {
        numberComment += e.comments.length;
      });
      course.forEach((e) => {
        numberComment += e.comments.length;
      });
      blog.forEach((e) => {
        numberComment += e.comments.length;
      });
      if (sale) {
        for (var i = 0; i < sale.length; i++) {
          const payment = await PaymentModel.findOne({
            authority: sale[i].authority,
          });
          date = sale[i].createdAt;
          for (let x = 0; x < sale[i].bookID.length; x++) {
            await BookModel.findOne({ _id: sale[i].bookID[x] });
            numberBook += 1;
          }
          for (let x = 0; x < sale[i].courseIDOnline.length; x++) {
            await CouresModel.findOne({ _id: sale[i].courseIDOnline[x] });
            numberCourseOnline += 1;
          }
          for (let x = 0; x < sale[i].courseIDOffline.length; x++) {
            await CouresModel.findOne({ _id: sale[i].courseIDOffline[x] });
            numberCourseOfline += 1;
          }
          for (let x = 0; x < sale[i].courseIDOInPerson.length; x++) {
            await CouresModel.findOne({ _id: sale[i].courseIDOInPerson[x] });
            numberCourseInPersone += 1;
          }
        }
        token = await SpotPlayerController.getTokenSpotPlayer(
          findUser._id,
          next,
        );
      }
      user['lengthCourseOnline'] = numberCourseOnline;
      user['lengthCourseOfline'] = numberCourseOfline;
      user['lengthCourseInPerson'] = numberCourseInPersone;
      user['lengthBook'] = numberBook;
      user['lengthcomment'] = numberComment;
      user['date'] = date;
      return res.status(StatusCodes.OK).json({
        StatusCode: StatusCodes.OK,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
  async editProfileUser(req, res, next) {
    try {
      let data = copyObject(req.body);
      const userID = req.user._id;
      let blackListField = Object.values(blackListFields);
      deleteInvalidPropertyInObject(data, blackListField);
      const fineUser = await UserModel.updateOne(
        { _id: userID },
        { $set: data },
      );
      if (fineUser.modifiedCount == 0)
        throw createHttpError('سروربا مشکل موجه شده است دوباره تلاش کنید');
      return res.status(StatusCodes.OK).json({
        StatusCode: StatusCodes.OK,
        message: 'پروفایل شما با موفقیت انجام شد',
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getEducationalVideoPurchasedOnline(req, res, next) {
    try {
      const user = req.user;
      const { limit } = req.params;
      const findSale = await SaleModel.find({ userID: user._id, verify: true });
      if (!findSale)
        return res.status(StatusCodes.OK).json({ educationalVideoOnline: [] });
      let list = [];
      findSale.forEach((e) => {
        e.courseIDOnline.forEach((p) => {
          list.push({ id: p, date: e.createdAt });
        });
      });
      let educationalVideoOnline = await this.limit(
        CouresModel,
        limit,
        list,
        next,
      );
      return res.status(StatusCodes.OK).json({
        StatusCode: StatusCodes.OK,
        educationalVideoOnline,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEducationalVideoPurchasedOfline(req, res, next) {
    try {
      const user = req.user;
      const { limit } = req.params;
      const findSale = await SaleModel.find({ userID: user._id, verify: true });
      if (!findSale)
        return res.status(StatusCodes.OK).json({ educationalVideoOffline: [] });
      let list = [];
      findSale.forEach((e) => {
        e.courseIDOffline.forEach((p) => {
          list.push({ id: p, date: e.createdAt, authority: e.authority });
        });
      });
      let educationalVideoOffline = await this.limit(
        CouresModel,
        limit,
        list,
        next,
      );
      return res.status(StatusCodes.OK).json({
        StatusCode: StatusCodes.OK,
        educationalVideoOffline,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEducationalVideoPurchasedInPerson(req, res, next) {
    try {
      const user = req.user;
      const { limit } = req.params;
      const findSale = await SaleModel.find({ userID: user._id, verify: true });
      if (!findSale)
        return res
          .status(StatusCodes.OK)
          .json({ educationalVideoInPerson: [] });
      let list = [];
      findSale.forEach((e) => {
        e.courseIDOInPerson.forEach((p) => {
          list.push({ id: p, date: e.createdAt });
        });
      });
      let educationalVideoInPerson = await this.limit(
        CouresModel,
        limit,
        list,
        next,
      );
      return res.status(StatusCodes.OK).json({
        StatusCode: StatusCodes.OK,
        educationalVideoInPerson,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBooktPurchased(req, res, next) {
    try {
      const user = req.user;
      const { limit } = req.params;
      const findSale = await SaleModel.find({ userID: user._id, verify: true });
      if (!findSale)
        return res.status(StatusCodes.OK).json({ educationalBook: [] });
      let list = [];
      findSale.forEach((e) => {
        e.bookID.forEach((p) => {
          list.push({ id: p, date: e.createdAt });
        });
      });
      let educationalBook = await this.limit(BookModel, limit, list, next);
      return res.status(StatusCodes.OK).json({
        StatusCode: StatusCodes.OK,
        educationalBook,
      });
    } catch (error) {
      next(error);
    }
  }

  async limit(model, limit, property, next) {
    try {
      let products = [];
      let maxItems = parseInt(limit, 10);
      if (isNaN(maxItems) || maxItems < 0) {
        maxItems = 0;
      }
      const authoritySet = new Set(
        property.filter((item) => item.authority).map((item) => item.authority),
      );
      const tokenMap = new Map();
      for (const auth of authoritySet) {
        const tokenDoc = await SpotPlayerModel.findOne({ authority: auth });
        console.log(
          `Fetched tokenDoc for authority ${auth}: ${tokenDoc ? 'found' : 'not found'}`,
        );
        if (tokenDoc) {
          console.log(
            `spotPlayer length for ${auth}: ${tokenDoc.spotPlayer.length}`,
          );
          tokenMap.set(auth, tokenDoc);
        }
      }

      const sortedProperty = [];
      const withToken = [];
      const withoutToken = [];

      for (const item of property) {
        let hasToken = false;
        if (item.authority) {
          const tokenDoc = tokenMap.get(item.authority);
          if (tokenDoc?.spotPlayer) {
            for (const e of tokenDoc.spotPlayer) {
              console.log(
                `Comparing courseID: ${e.courseID.toString()} with item.id: ${item.id.toString()}`,
              );
              if (
                e.courseID.toString() === item.id.toString() &&
                e.token &&
                e.token.trim() !== ''
              ) {
                hasToken = true;
                console.log(
                  `Found token for course ${item.id} in authority ${item.authority}`,
                );
                break;
              }
            }
          }
        }
        if (hasToken) {
          withToken.push(item);
        } else {
          withoutToken.push(item);
        }
      }

      sortedProperty.push(...withToken, ...withoutToken);

      const itemCount =
        maxItems > 0
          ? Math.min(maxItems, sortedProperty.length)
          : Math.min(5, sortedProperty.length);

      for (let i = 0; i < itemCount; i++) {
        const currentItem = sortedProperty[i];
        // console.log(`Processing id: ${currentItem.id}`);
        let product = await model.findOne({ _id: currentItem.id });
        // console.log(`type: ${product.type}, item_type: ${product?.subCourse}`);
        if (product) {
          product = copyObject(product);
          product['date'] = currentItem.date || '';
          product['authority'] = currentItem.authority;

          let shouldAdd = true;
          console.log(`title: ${product.title} , type: ${!!product?.type}`);
          if (product.item_type === 'course' && product.type === 'offline') {
            const tokenDoc = tokenMap.get(currentItem.authority);
            let tokenSP = '';

            if (tokenDoc?.spotPlayer) {
              for (const e of tokenDoc.spotPlayer) {
                // console.log(`Comparing in add: courseID: ${e.courseID.toString()} with product._id: ${product._id.toString()}`);
                if (e.courseID.toString() === product._id.toString()) {
                  if (e.token && e.token.trim() !== '') {
                    tokenSP = e.token;
                    console.log(
                      `Assigned token SP: ${tokenSP} for product ${product._id}`,
                    );
                    break;
                  }
                }
              }
            } else {
              // console.log(`No tokenDoc for authority ${currentItem.authority}`);
            }

            product['tokenSP'] = tokenSP;

            if (!tokenSP || tokenSP.trim() === '') {
              shouldAdd = false;
              // console.log(`Not adding product ${product._id} because tokenSP is empty`);
            }
          } else {
            // console.log(`Not offline course, adding without token check: ${product._id}`);
          }

          if (shouldAdd) {
            products.push(product);
            // console.log(`Added product: ${product._id}`);
          }
        } else {
          // console.log(`Product not found for id: ${currentItem.id}`);
        }
      }

      console.log(`Final products length: ${products.length}`);
      return products;
    } catch (error) {
      next(error);
    }
  }

  async getAllUser(req, res, next) {
    try {
      const result = await UserModel.find(
        {},
        { first_name: 1, last_name: 1, phone: 1, email: 1 },
      );
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  UserController: new UserController(),
};
