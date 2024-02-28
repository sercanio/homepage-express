class StorageService {
  constructor(options, credentials, callback) {
    this.options = options || Object.create(null);
    this.credentials = credentials || Object.create(null);
    this.callback = callback || new Function();
  }
  get(key) {
    throw new Error('Method is not implemented in the base class.')
  }
  list() {
    throw new Error('Method is not implemented in the base class.')
  }
  upload(file) {
    throw new Error('Method is not implemented in the base class.')
  }
  delete(key) {
    throw new Error('Method is not implemented in the base class.')
  }

}
// TODO: Complete this class
class S3Service extends StorageService {
  constructor(options, credentials, callback) {
    super(options, credentials, callback);
  }

  static create(options, credentials, callback) {
    return new S3Service(options, credentials, callback);
  }

  get(key) {
    return new Promise((resolve, reject) => {
      const s3 = new AWS.S3(this.credentials);
      const params = {
        Bucket: this.options.bucket,
        Key: key,
      };
      s3.getObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  list() {
    return new Promise((resolve, reject) => {
      const s3 = new AWS.S3(this.credentials);
      const params = {
        Bucket: this.options.bucket,
      };
      s3.listObjects(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  upload(file) {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(file.path);
      const s3 = new AWS.S3(this.credentials);
      const params = {
        ACL: 'public-read',
        Body: fileStream,
        Bucket: this.options.bucket,
        ContentType: file.mimetype,
        Key: file.originalname,
      };
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  delete(key) {
    return new Promise((resolve, reject) => {
      const s3 = new AWS.S3(this.credentials);
      const params = {
        Bucket: this.options.bucket,
        Key: key,
      };
      s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}