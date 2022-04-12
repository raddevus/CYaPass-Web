function encrypt(message, key, useIV){
    if (useIV){
      let  iv   = CryptoJS.enc.Hex.parse(key);
    message = CryptoJS.AES.encrypt(message, iv,{iv: iv});
    }
  else{
    message = CryptoJS.AES.encrypt(message, key);
  }
  
    return message.toString();
}

function decrypt(message){
    let code;  

    console.log(`pwdBuffer: ${pwdBuffer}`)
    let  iv   = CryptoJS.enc.Hex.parse(pwdBuffer);
    console.log(`iv ${iv}`);
    code = CryptoJS.AES.decrypt(message, iv,{iv:iv});
    console.log(`code ${code}`);

    var decryptedMessage = code.toString(CryptoJS.enc.Utf8);
  
    return decryptedMessage;
}
  

function encryptFromText(clearText){
  let useIV = true;
  let encryptedText = encrypt(clearText,pwd,useIV);
  console.log(encryptedText);
  return encryptedText;

}

function decryptFromText(cipherText){
  
  console.log(`cipherText ${cipherText}`);
  let useIV = true;
  
  //let hashValue = sha256(pwd);
  console.log(pwd);
  
  return decrypt(cipherText.trim());
}