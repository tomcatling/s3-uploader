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

function Upload() {
  var files = document.getElementById("objectupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  var file = files[0];
  var objectKey = file.name;

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
    accessKeyId: keyid,
    secretAccessKey: keysecret
  });

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
	options = {
    partSize: 1024 * 1024 * 1024, 
    queueSize: 4
  },
    (err, data) => {
      if (err){
        $(".progress-number").html('<font color="red">'+err+'</font>');
        console.log(err);
      }
      else {
        $(".progress-number").html("Upload complete")
        console.log('Done.');
      }
    }
  ).on('httpUploadProgress', function(progress) {
      var progress = parseInt((progress.loaded * 100) / progress.total);
      console.log("Uploaded :: " + progress +'%');
      $('#progress .progress-bar').css(
            'width',
            progress + '%'
      );
      $(".progress-number").html(getReadableFileSizeString(file.size * progress / 100)+" / "+getReadableFileSizeString(file.size));
  });
  
}