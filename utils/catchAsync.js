module.exports = function catchAsync(func) {
	return (req, res, next) => {
		func(req, res, next).catch((e) => next(e));
	};
};

// colt's way:
// module.exports = func => {
//     return (req, res, next) => {
//         func(req, res, next).catch(next)
//     }
// }

// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// /
// //helpers from lessons:
// function wrapAsync(fn) {
//     return function (req, res, next) {
//         fn(req, res, next).catch(e => next(e))
//     }
// }

// class AppError extends Error {
//     constructor(message, status) {
//         super();
//         this.message = message;
//         this.status = status;
//     }
// }

// module.exports = AppError;
