const { https } = require("firebase-functions");
const next = require("next");

const app = next({
	dev: false,
	conf: {
		/* your next.config.js settings here if needed */
	},
});
const handle = app.getRequestHandler();

exports.nextjsFunc = https.onRequest((req: any, res: any) => {
	return app.prepare().then(() => handle(req, res));
});
