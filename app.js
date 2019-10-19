var bucketName = "uploader-test-tomcatling";
var bucketRegion = "eu-west-2";

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.Credentials({
    accessKeyId: "xx",
    secretAccessKey: "xx",
    sessionToken: null
  })
});
AWS.config.httpOptions.timeout = 0;
AWS.config.logger = console;

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  useAccelerateEndpoint: true,
  params: { 
  	Bucket: bucketName
  }
});


function getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' KB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}


function addObject() {
  var files = document.getElementById("objectupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  var file = files[0];
  var fileName = file.name;

  var objectKey = fileName;

  $('#progress .progress-bar').css('width',"0px");
  $('#progress .progress-number').text("");
  // Use S3 ManagedUpload class as it supports multipart uploads
  s3.upload(
    params = {
      Bucket: bucketName,
      Key: objectKey,
      Body: file,
      ACL: "private"
	},
	options = {partSize: 1024 * 1024 * 1024, queueSize: 4},
    (err, data) => {
      console.log('done');
    }
  ).on('httpUploadProgress', function(progress) {
      var progress = parseInt((progress.loaded * 100) / progress.total);
      console.log("Uploaded :: " + progress +'%');
      $('#progress .progress-bar').css(
            'width',
            progress + '%'
      );
      $(".progress-number").html(getReadableFileSizeString(file.size * progress / 100)+" / "+getReadableFileSizeString(file.size)).css({'margin-left' : -$('.progress-number').width()/2}
      );
  });
  
}