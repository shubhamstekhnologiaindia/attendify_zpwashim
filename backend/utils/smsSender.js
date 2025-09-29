import axios from 'axios';

export async function sendStatusApprovedSMS(mobile) {
  const message = "आपली विनंती मुख्यालयाकडून मंजूर झाली आहे. - SHRI NILKANTHESHWAR";
  const encodedMessage = encodeURIComponent(message);

  const url = `http://bulksms.saakshisoftware.com/api/mt/SendSMS?user=TECHNOLOGIA&password=70837513&senderid=SNILKN&channel=Trans&DCS=8&flashsms=0&number=${mobile}&text=${encodedMessage}&route=04&DLTTemplateId=1707174402543957427&PEID=1701172491385434035`;

  try {
    const response = await axios.get(url);
    if (response.data.ErrorCode === "000") {
      console.log(` SMS sent to ${mobile}`);
      return true;
    } else {
      console.error(` SMS failed`, response.data);
      return false;
    }
  } catch (error) {
    console.error(` SMS API Error: ${error.message}`);
    return false;
  }
}
