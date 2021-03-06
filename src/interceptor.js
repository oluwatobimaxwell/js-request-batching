import axios, { CancelToken } from "axios";
import md5 from "md5";
import { v4 } from "uuid";

let requests = [];
let responses = [];
const batchSize = 5;
const timeOut = 750;
const timeLimit = 500;

Array.prototype.unique = function () {
	return [...new Set(this)]
}

function fetchResponses(startIndex = 0) {
	const start = startIndex;
	const end = batchSize - 1 + start;
	const batch = requests.filter((_, j) => j >= start && j <= end);
	if (batch.length > 0){
		const requestData = batch.map((e) => { return { id: e.id, fileIds: e?.request?.params?.ids } });
		const ids = batch.map((e) => { return e?.request?.params?.ids }).join().split(",").unique();
		let request = batch[0].request;
		request.params.ids = ids;
		axios(request).then(({ data = {} }) => {
			const { items = [] } = data;
			runAfter(setResponses(requestData, items)).then(() => {
				setBatchIndex(end);
			});
		})
	}else{
		setBatchIndex(end);
	}
}

function setResponses(requestData = [], items = []) {
	requestData.forEach(({ id = null, fileIds = [] }) => {
		responses.push({
			id,
			files: items.filter((e) => fileIds.includes(e.id)),
		});
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

function responseHandler(id){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const response = responses.find((e) => e.id === id);
			if(!response) return resolve(responseHandler(id));
			if (response?.files?.length > 0) {
				return resolve({ data: { items: response.files } });
			}
			return reject("No results");
		}, timeOut);
	});
}

function batchInterceptor(instance) {
	instance.interceptors.request.use(
		function (request) {
			if (requests.length === 0) {
				batchTimer();
			}
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
			return responseHandler(error?.message)
		},
	);
}

export default batchInterceptor;
