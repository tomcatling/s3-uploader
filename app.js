var bucketName = "uploader-test-tomcatling";
var bucketRegion = "eu-west-2";

AWS.config.region = bucketRegion;
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

function fixFilename(username, filename) {
  var cleanfilename = filename.replace(/[^a-zA-Z0-9\.\-\_]+/g,"");
  return username + '/' + cleanfilename
}

function validateInputs() {
  var files = document.getElementById("objectupload").files;
  if (!files.length) {
    return "Please choose a file to upload first.";
  }

  var keyid = document.getElementById("keyid").value;
  var keysecret = document.getElementById("keysecret").value;
  var checked = document.getElementById("acceptanceCheck").checked;

  if (keyid === "" || keysecret === "") {
    return "Please enter credentials first.";
  }

  if (!checked) {
    return "Please confirm that the data being submitted conforms to our guidelines.";
  }

}

function lockForm() {
  document.getElementById("overlay").style.display = 'block';
}

function unlockForm() {
  document.getElementById("overlay").style.display = 'none';
}

function Upload() {

  lockForm();

  var msg = validateInputs()
  if (msg) {return alert(msg);}

  var file = document.getElementById("objectupload").files[0];
  var keyid = document.getElementById("keyid").value;
  var keysecret = document.getElementById("keysecret").value;

  var sts = new AWS.STS(
    options = {
      sslEnabled: true,
      clientSideMonitoring: true,
      logger: console,
      accessKeyId: keyid,
      secretAccessKey: keysecret
    }
  );

  var promise = sts.getCallerIdentity().promise();

  // handle promise's fulfilled/rejected states
  promise.then(
    function(data) {
      var username = data.Arn.split('/').slice(-1)[0]
      var objectKey = fixFilename(username, file.name);

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
      lockForm();

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
        partSize: Math.max(file.size / 1000, 5 * 1024 * 1024),
        queueSize: 4
      },
        (err, data) => {
          if (err){
            unlockForm();
            $(".progress-number").html(
              '<font color="red">'
              + err
              + '</font>');
            console.log(err);
          }
          else {
            unlockForm();
            $(".progress-number").html(
              'Upload complete. <br> Object has the key: <font color="red">' 
              + bucketName 
              + '/' 
              + objectKey 
              +'</font>'
              )
          }
          document.getElementById("addobject").disabled = false;
        }
      ).on('httpUploadProgress', function(progress) {
          console.log(progress.loaded )
          var progress = (progress.loaded * 100) / progress.total;
          var progressInt = parseInt(progress)
          $('#progress .progress-bar').css('width',progressInt + '%');
          $(".progress-number").html(
            getReadableFileSizeString(file.size * progress / 100)+" / "+getReadableFileSizeString(file.size)
            );
      });


    },
    function(error) {
      unlockForm();
      return alert("Cannot validate credentials.");
    }
  );

  
}