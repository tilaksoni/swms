const otpGenerator = require("otp-generator");

const generateOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,
    upperCase: false,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

module.exports = generateOTP;