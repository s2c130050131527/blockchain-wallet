import request from "request-promise";
const messageEngineLink = process.env.OTP_URL;
const authKey = process.env.OTP_AUTH_KEY;
const otpExpiryMin = process.env.OTP_EXPIRY_MIN;
console.log(authKey);
class Messager {
  generateOTP(otpLen) {
    let otp = '';
    for (let k = otpLen; k > 0; k --) {
      otp += Math.floor(Math.random() * 9) + 0;
    }
    return otp;
  }
  async sendOTPMobile(mobileNumber, sender, message, otp) {
    let options = {
      method: 'GET',
      uri: messageEngineLink + `sendotp.php`,
      qs: {
        authkey: authKey,
        message: message,
        sender: sender,
        mobile: mobileNumber,
        otp: otp,
        otp_expiry: otpExpiryMin
      },
      json: true
    }
    console.log(options)
    let sendOTPResponse = await request(options);
    return sendOTPResponse;
  }
  async verifyOTPMobile(mobileNumber, otp) {
    let options = {
      method: 'GET',
      uri: messageEngineLink + `verifyRequestOTP.php`,
      qs: {
        authkey: authKey,
        mobile: mobileNumber,
        otp: otp,
      },
      json: true
    };
    let verifyOTPResponse = await request(options);
    return verifyOTPResponse;
  }
}

export default new Messager();
