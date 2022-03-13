import axios, { CancelToken } from "axios";
import md5 from "md5";
import { v4 } from "uuid";

let requests = [];
let responses = [];
const batchSize = 5;
const timeOut = 2000;
const timeLimit = 500;

function fetchResponses(startIndex = 0) {
	const start = startIndex;
	const end = batchSize - 1 + start;

	const batch = requests.filter(
		(_, j) =>
			j >= start &&
			j <= end &&
			!responses
				.map((e) => {
					return e.id;
				})
				.includes(_.id),
	);

	axios
		.all(
			batch.map((e) => {
				return axios(e.request);
			}),
		)
		.then(
			axios.spread((...res) => {
				runAfter(setResponses(res)).then(() => {
					setBatchIndex(end);
				});
			}),
		);
}

function setResponses(res) {
	res.forEach((response, i) => {
		responses.push({ id: requests[i]?.id, response });
	});
	return;
}

function setBatchIndex(end) {
	if (requests.length - 1 > end) {
		batchTimer(end + 1);
	} else {
		requests = [];
	}
}

function runAfter(res) {
	return new Promise(function (fulfill, reject) {
		fulfill(res);
	});
}

function batchTimer(startIndex = 0) {
	setTimeout(() => {
		fetchResponses(startIndex);
	}, timeLimit);
}

function batchInterceptor(instance) {
	instance.interceptors.request.use(
		function (request) {
			if (requests.length === 0) {
				batchTimer();
			}
			instance.defaults.timeout = timeOut;
			const timeStamp = new Date().getTime();
			const id = md5(JSON.stringify(request) + v4());
			requests.push({ request, id, time: timeStamp });
			return {
				cancelToken: new CancelToken((cancel) => cancel(id)),
			};
		},
		function (error) {},
	);

	instance.interceptors.response.use(
		function (response) {
			if (response?.data?.items?.length > 0) {
				return Promise.resolve({ data: response.data });
			}
			return Promise.reject("No results");
		},
		function (error) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					const { response = {} } =
						responses.find((e) => e.id === error?.message) || {};
					if (response?.data?.items?.length > 0) {
						return resolve({ data: response?.data });
					}
					return reject("No results");
				}, timeOut);
			});
		},
	);
}

export default batchInterceptor;
