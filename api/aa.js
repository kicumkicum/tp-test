module.exports = (req, res) => {
  var mem = require('memory-chunk-store')
  const torrentStream = require(`torrent-stream`)
  // const {filePath, magnet} = req.params;
  const filePath = `bbb_sunflower_1080p_30fps_normal.mp4`;
  const magnet = `88594AAACBDE40EF3E2510C47374EC0AA396C08E`;
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
