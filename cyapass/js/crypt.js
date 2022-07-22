let iv;

function encrypt(message, key, useIV){
  if (useIV){
    iv = CryptoJS.lib.WordArray.random(128/8).toString();
    console.log(iv.toString());
    message = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(key),{iv: CryptoJS.enc.Hex.parse(iv)});
  }
  else
  {
    message = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(key));
  }
  
  return message.toString();
}

function decrypt(message,iv){
    let code;  

    console.log(`pwdBuffer: ${pwdBuffer}`)
    console.log(`iv ${iv}`);

    code = CryptoJS.AES.decrypt(message, CryptoJS.enc.Hex.parse(pwdBuffer),{iv:CryptoJS.enc.Hex.parse(iv)});
    console.log(`code ${code}`);

    var decryptedMessage = code.toString(CryptoJS.enc.Utf8);
  
    return decryptedMessage;
}
  

function encryptFromText(clearText){
  let useIV = true;
  let encryptedText = encrypt(clearText,pwdBuffer,useIV);
  console.log(encryptedText);
  return encryptedText;

}

function decryptFromText(cipherText,iv){

  console.log(`pwd: ${pwd}`);
  
  return decrypt(cipherText.trim(),iv,true);
}

function generateHmac(encryptedData, in_iv){
  
  console.log(`in_iv : ${in_iv}`);
  console.log(`pwdBuffer: ${pwdBuffer}`);
  // hmac function requires KEY value 1st (opposite of other library)
  let Hmac = sha256.hmac(pwdBuffer,`${in_iv}:${encryptedData}`);
  
  //let Hmac = sha256.hmac();
  console.log(`mac : ${Hmac}`);
  return Hmac;
}