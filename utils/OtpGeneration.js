function generateNumericOTP(length) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // digit between 0–9
  }
  return otp;
}

export {generateNumericOTP}