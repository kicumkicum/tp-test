const express = require(`express`);
const BTStream = require('bt-stream');
const torrentStream = require(`torrent-stream`)
let torrent;
const app = express();

const logger = (req, res, next) => {
	console.log(`Requested ${req.path}`);
	next();
};

const cors = (req, res, next) => {
	res.header(`Access-Control-Allow-Origin`, `*`);
	res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept, Authorization`);
	res.header(`Access-Control-Allow-Methods`, `GET, POST, OPTIONS, PUT, DELETE`);
	next();
};
app.use(logger);
app.use(cors);

app.get('/ping', (req, res) => {
	// const magnet = decodeURIComponent(req.originalUrl.substr('/getMetadata/'.length));
	console.log(`getMetadata`, {url: req.originalUrl});
	// console.log(`getMetadata`, {magnet});
	return res.send(`good`);
});

app.get('/getMetadata/:magnet', (req, res) => {
	const magnet = decodeURIComponent(req.originalUrl.substr('/getMetadata/'.length));
	console.log(`getMetadata`, {url: req.originalUrl});
	console.log(`getMetadata`, {magnet});
	const btStream = new BTStream({dhtPort: Math.floor(Math.random() * 10000)});

	console.log({magnet})
	return btStream.getMetaData(magnet)
		.then((_torrent) => {
			torrent = _torrent;
			// console.log(`proxy:getMetadata`, {torrent});
			res.send({files: torrent.files.map((file) => ({name: file.name, path: file.path}))});
		})
		.catch((err) => console.error({err}));
});

app.get('/download/:magnet/:filePath', (req, res) => {
	console.log(`proxy:download`);
	const {filePath, magnet} = req.params;
	console.log({filePath});
	console.log(req.params.magnet);

	const btStream = new BTStream({dhtPort: Math.floor(Math.random() * 10000)});

	console.log({magnet})
	console.log(`proxy:download:before_getMetaData`);
	return btStream.getMetaData(magnet)
		.then((torrent) => {
			console.log(`proxy:download:after_getMetaData`);
			const stream = btStream.downloadFileByPath({torrent, filePath});
			stream.pipe(res);
		});
});


app.get('/download2/:magnet/:filePath', (req, res) => {
	var mem = require('memory-chunk-store')
	const {filePath, magnet} = req.params;
	console.log(magnet);
	const engine = torrentStream(magnet, {
		storage: mem
	});

	engine.on('ready', function () {
		const file = engine.files.find(function (file, i) {
			console.log('file:', file);
			return file.path === filePath;
		});
		// const files = engine.files.map((file) => ({name: file.name, path: file.path}));

		const stream = file.createReadStream();
		res.setHeader('Content-disposition', 'attachment; filename=' + "afile.jpg");
		res.setHeader('Content-Length', file.length);
		res.setHeader('Content-Type','image/jpeg');
		stream.pipe(res);
	});
});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server started on ${port} port`))
