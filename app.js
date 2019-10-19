var bucketName = "uploader-test-tomcatling";
var bucketRegion = "eu-west-2";

AWS.config.region = bucketRegion;
AWS.config.httpOptions.timeout = 0;
AWS.config.logger = console;


function getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' KB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

function uuidv4() {
  return 'xxxxxxxxxxxxxxxxxxxx-'.replace(/[x]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function fixFilename(filename) {
  var cleanfilename = filename.replace(/[^a-zA-Z0-9\.\-\_]+/g,"");
  var trimmed = cleanfilename.slice(cleanfilename.length - 30)
  return uuidv4() + trimmed
}

function Upload() {
  var files = document.getElementById("objectupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  
  var file = files[0];

  if (file.size/1024/1024/1024 > 200) {
    return alert("This file is too large. Individual submissions must be < 200GB.");
  }


  var objectKey = fixFilename(file.name);

  var keyid = document.getElementById("keyid").value;
  var keysecret = document.getElementById("keysecret").value;
  var checked = document.getElementById("acceptanceCheck").checked;

  if (keyid === "" || keysecret === "") {
    return alert("Please enter credentials first.");
  }

  if (!checked) {
    return alert("Please confirm that the data being submitted conforms to our guidelines.");
  }

  var s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    useAccelerateEndpoint: true,
    clientSideMonitoring: true,
    logger: console,
    computeChecksums: true,
    sslEnabled: true,
    accessKeyId: keyid,
    secretAccessKey: keysecret
  });

  $('#progress .progress-bar').css('width',"0px");
  $('#progress .progress-number').text("");
  document.getElementById("addobject").disabled = true;

  // Use S3 ManagedUpload class as it supports multipart uploads
  s3.upload(
    params = {
      Bucket: bucketName,
      Key: objectKey,
      Body: file,
      ACL: "private",
      ServerSideEncryption: 'AES256',
	},
	options = {
    partSize: 25 * 1024 * 1024, 
    queueSize: 6
  },
    (err, data) => {
      if (err){
        $(".progress-number").html('<font color="red">'+err+'</font>');
        console.log(err);
      }
      else {
        $(".progress-number").html('Upload complete. <br> Your submission ID is: <font color="red">' + objectKey +'</font>')
        console.log('Done.');
      }
      document.getElementById("addobject").disabled = false;
    }
  ).on('httpUploadProgress', function(progress) {
      var progress = (progress.loaded * 100) / progress.total;
      var progressInt = parseInt(progress)
      console.log("Uploaded :: " + progress +'%');
      $('#progress .progress-bar').css(
            'width',
            progressInt + '%'
      );
      $(".progress-number").html(getReadableFileSizeString(file.size * progress / 100)+" / "+getReadableFileSizeString(file.size));
  });
  
}