import { query } from "../../../../utils/database.js"; 
import { decrypt, decryptDeterministic,encrypt,encryptDeterministic } from "../../../../utils/crypto.js"; 
import axios from "axios";


export const UserService = {

  RegisterUser: async (userData) => {
    try {
        const {
            first_name, middle_name, last_name,
            mob_no, email, department_id, office_location_id,
            taluka_id, village_id, cader_id,
            password, role_id, device_id
        } = userData;
      
        const sql = `CALL RegisterUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        console.log("results")

        const results = await query(sql, [
            encrypt(first_name),
            encrypt(middle_name),
            encrypt(last_name),
            encryptDeterministic(mob_no),
            encrypt(email),
            department_id,
            office_location_id,
            taluka_id,
            village_id,
            cader_id,
            encrypt(password),
            role_id,
            device_id
        ]);

        console.log(results)

        return results;
    } catch (error) {
        console.error("Error in RegisterUser service:", error);
        throw new Error("Failed to register user");
    }
},




  getUserProfileById: async (id) => {
    const user = await query(
      "SELECT id, first_name, middle_name, last_name, mob_no, email FROM users WHERE id = ?",
      [id]
    );

    if (user.length === 0) {
      return null;
    }

    return {
      id: user[0].id,
      first_name: decrypt(user[0].first_name),
      middle_name: user[0].middle_name ? decrypt(user[0].middle_name) : null,
      last_name: decrypt(user[0].last_name),
      mob_no: decryptDeterministic(user[0].mob_no), 
      email: user[0].email ? decrypt(user[0].email) : null,
    };
  },

  SendOtp: async (phoneNumber, otp) => {
   
    try {
        const apiUrl = 'http://bulksms.saakshisoftware.com/api/mt/SendSMS';

        const params = {
            user: 'Tekhnologia',
            password: 'Tech%40123%23',
            senderid: 'SNILKT',
            channel: 'Trans',
            DCS: '04',
            flashsms: '0',
            number: phoneNumber,
            text: `आपला ओटीपी क्रमांक आहे: ${otp} कृपया हा ओटीपी पुढील प्रक्रियेसाठी वापरा. - झेडपी वाशिम SHRI NILKANTHESHWAR`,
            route: '04',
            DLTTemplateId: '1707174402037894471',
            PEID: '1701172491385434035'
        };

        const response = await axios.get(apiUrl, { params });
      

        if (response.status === 200) {
            return response.data; // Return the response data if needed
        } else {
            throw new Error("Failed to send OTP");
        }
    } catch (error) {
        console.error("Error in SendOtp service:", error);
        throw new Error("Failed to send OTP");
    }
}
};
