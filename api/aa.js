module.exports = (req, res) => {
  var mem = require('memory-chunk-store')
  const torrentStream = require(`torrent-stream`)
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
};
