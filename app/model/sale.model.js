const mongoose = require('mongoose');
const {
  SpotPlayerController,
} = require('../http/controller/api/spotplayer.controller');
const { CouresModel } = require('./course.model');
const MelipayamakApi = require('melipayamak');
const { UserModel } = require('./user.model');
const { PaymentModel } = require('./payments');
const { BookModel } = require('./book.model');
const courseModel = require('./course.model');
const username = '09307886969';
const password = 'FL2$Q';
const api = new MelipayamakApi(username, password);

const saleSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Types.ObjectId, require: true, ref: 'user' },
    city: { type: String },
    provice: { type: String },
    address: { type: String },
    sale: { type: Array },
    bookID: { type: [mongoose.Types.ObjectId], ref: 'book', default: [] },
    codeSpotPlayer: { type: String },
    verify: { type: Boolean, default: false },
    courseIDOnline: { type: [mongoose.Types.ObjectId], default: [] },
    courseIDOffline: { type: [mongoose.Types.ObjectId], default: [] },
    courseIDOInPerson: { type: [mongoose.Types.ObjectId], default: [] },
    authority: { type: String, default: '' },
    trackingCode: { type: String, default: '' },
    sendStatusCode: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true },
  },
);

saleSchema.pre('findOneAndUpdate', async function (next) {
  console.log('model');
  const model = await this.model.findOne(this.getQuery());
  const user = await UserModel.findOne({ _id: model.userID });
  const courses = [];
  for (let i = 0; i < model.courseIDOffline.length; i++) {
    const course = await CouresModel.findOne({ _id: model.courseIDOffline[i] });
    courses.push(course._id);
  }
  if (courses.length > 0) {
    await SpotPlayerController.postInformation(
      courses,
      model.userID,
      model.authority,
      model._id,
    );
  }
  const payment = await PaymentModel.findOne({ authority: model.authority });
  console.log(`authority sale :${model.authority}`);
  let products = [];
  if (model.bookID) {
    for (var i = 0; i < model.bookID.length; i++) {
      const book = await BookModel.findOne({ _id: model.bookID[i] });
      if (book) products.push(book.title);
    }
  }
  if (model.courseIDOInPerson) {
    for (var i = 0; i < model.courseIDOInPerson.length; i++) {
      const course = await CouresModel.findOne({
        _id: model.courseIDOInPerson[i],
      });
      if (course) products.push(course.title);
    }
  }
  if (model.courseIDOffline) {
    for (var i = 0; i < model.courseIDOffline.length; i++) {
      const course = await CouresModel.findOne({
        _id: model.courseIDOffline[i],
      });
      if (course) products.push(course.title);
    }
  }
  if (model.courseIDOnline) {
    const courseSpotPlayer = [];
    for (var i = 0; i < model.courseIDOnline.length; i++) {
      const course = await CouresModel.findOne({
        _id: model.courseIDOnline[i],
      });
      if (course.subCourse.length > 0) {
        console.log(`sub: ${course.subCourse}`);
        for (var j = 0; j < course.subCourse.length; j++) {
          const findCourse = await CouresModel.findOne({
            _id: course.subCourse[j],
          });
          console.log(`course: ${findCourse.title}`);
          console.log('id model ' + model._id);
          if (findCourse.type == 'offline') {
            model.courseIDOffline = [...model.courseIDOffline, findCourse._id];
            await model.save();
            console.log('yes');
            courseSpotPlayer.push(findCourse._id);
          } else if (findCourse.type == 'online') {
            model.courseIDOnline = [...model.courseIDOnline, findCourse._id];
            await model.save();
            // await model.updateOne({ _id: model._id }, {
            //   $push: {
            //     courseIDOnline: course.subCourse[j]
            //   }
            // });
          }
        }
      }
      if (courseSpotPlayer.length > 0) {
        await SpotPlayerController.postInformation(
          courseSpotPlayer,
          model.userID,
          model.authority,
          model._id,
        );
      }
      if (course) products.push(course.title);
    }
  }
  products = String(products);
  const username = '09307886969';
  const password = 'FL2$Q';
  const api = new MelipayamakApi(username, password);
  const smsRest = api.sms();
  const to = '' + user.phone;
  const from = '50004001886969';
  const name = user.first_name + user.last_name;
  const text = `${name};${products};${payment.amount};${payment.invoiceNumber}`;
  smsRest
    .sendByBaseNumber(text, to, 175774)
    .then((e) => {
      console.log(e);
    })
    .catch((err) => {
      console.log('err' + err);
    });
  const saber = '09307886969';
  const text2 = `${name};${products};${payment.amount};${payment.invoiceNumber}`;
  smsRest
    .sendByBaseNumber(text2, saber, 175835)
    .then((e) => {
      console.log(e);
    })
    .catch((err) => {
      console.log('err' + err);
    });
});

const model = mongoose.model('sale', saleSchema);

module.exports = {
  SaleModel: model,
};
