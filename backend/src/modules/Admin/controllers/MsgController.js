
//import MsgService from "../services/MsgService";

import  {MsgService1 } from "../services/msgService.js";

export const MsgController = {

    MsgController : async (req, res)=> {
        try {
          const { allEmployees,officeLocationIds=[],caderIds=[], departmentIds = [], zpIds = [], villageIds = [], sansthIds = [] } = req.body;
    
          if (allEmployees !== "1" && !officeLocationIds.length&& !caderIds.length && !departmentIds.length && !zpIds.length && !villageIds.length && !sansthIds.length) {
            return res.status(400).json({ status: false, message: "At least one filter must be provided" });
          }
    
          const mobileNumbers = await MsgService1.SendMsg(allEmployees, departmentIds,officeLocationIds,caderIds, zpIds, villageIds, sansthIds);
    
          if (!mobileNumbers.length) {
            return res.status(404).json({ status: false, message: "No mobile numbers found" });
          }
    
          return res.status(200).json({ status: true, mobileNumbers });
    
        } catch (error) {
          console.error("Error fetching mobile numbers:", error);
          return res.status(500).json({ status: false, message: "Internal server error" });
        }
      }
    
    }









// const sendmessage= async (req, res) => {
//     try {
//         const { allEmployees, departmentIds, zpIds, villageIds, sansthIds } = req.body;
//         const mobileNumbers = await getMobileNumbers(allEmployees, departmentIds, zpIds, villageIds, sansthIds);
//         res.json({ mobileNumbers });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// }





// // Import required packages
// const mysql = require('mysql2/promise');
// const { SmsClient } = require('@azure/communication-sms');

// // Create a MySQL connection pool (update with your actual database credentials)
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'your_user',
//     password: 'your_password',
//     database: 'your_database_name' // e.g., 'attendify_zp_washim_new_1'
// });

// /**
//  * Fetches mobile numbers from the users table based on input conditions.
//  * @param {string} allEmployees - '1' to fetch all users, otherwise apply filters.
//  * @param {number[]|null} departmentIds - Array of department IDs or null.
//  * @param {number[]|null} zpIds - Array of district IDs or null.
//  * @param {number[]|null} villageIds - Array of village IDs or null.
//  * @param {number[]|null} sansthIds - Array of sanstha IDs or null.
//  * @returns {Promise<string[]>} - Array of mobile numbers.
//  * @throws {Error} - If no filter is provided when allEmployees is not '1'.
//  */
// async function getMobileNumbers(allEmployees, departmentIds, zpIds, villageIds, sansthIds) {
//     // Base query to select mobile numbers
//     let query = 'SELECT mob_no FROM users';
//     let params = [];

//     // If allEmployees is not '1', apply filters
//     if (allEmployees !== '1') {
//         // Check if at least one filter is provided
//         const hasFilters = (departmentIds && departmentIds.length > 0) ||
//                            (zpIds && zpIds.length > 0) ||
//                            (villageIds && villageIds.length > 0) ||
//                            (sansthIds && sansthIds.length > 0);
//         if (!hasFilters) {
//             throw new Error('At least one filter must be provided when allEmployees is not 1');
//         }

//         // Start WHERE clause with a tautology for easy condition appending
//         query += ' WHERE 1=1';

//         // Add filter for department_ids
//         if (departmentIds && departmentIds.length > 0) {
//             const placeholders = departmentIds.map(() => '?').join(',');
//             query += ` AND department_id IN (${placeholders})`;
//             params.push(...departmentIds);
//         }

//         // Add filter for zp_ids (district_id)
//         if (zpIds && zpIds.length > 0) {
//             const placeholders = zpIds.map(() => '?').join(',');
//             query += ` AND district_id IN (${placeholders})`;
//             params.push(...zpIds);
//         }

//         // Add filter for village_ids
//         if (villageIds && villageIds.length > 0) {
//             const placeholders = villageIds.map(() => '?').join(',');
//             query += ` AND village_id IN (${placeholders})`;
//             params.push(...villageIds);
//         }

//         // Add filter for sansth_ids (user_sanstha_id)
//         if (sansthIds && sansthIds.length > 0) {
//             const placeholders = sansthIds.map(() => '?').join(',');
//             query += ` AND user_sanstha_id IN (${placeholders})`;
//             params.push(...sansthIds);
//         }
//     }

//     // Uncomment these lines for debugging to view the final query and parameters:
//     // console.log('Final Query:', query);
//     // console.log('Parameters:', params);

//     // Execute the query with parameters
//     const [rows] = await pool.execute(query, params);

//     // Extract mobile numbers from the result
//     const mobileNumbers = rows.map(row => row.mob_no);
//     return mobileNumbers;
// }

// /**
//  * Sends bulk SMS messages to the provided list of mobile numbers using Azure Communication Services.
//  * @param {string[]} mobileNumbers - Array of recipient mobile numbers (in E.164 format).
//  * @param {string} message - The message content to send.
//  * @returns {Promise<object>} - The response from Azure Communication Services.
//  */
// async function sendBulkSMS(mobileNumbers, message) {
//     // Retrieve the connection string and from phone number from environment variables
//     const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];
//     const fromPhoneNumber = process.env['AZURE_FROM_PHONE_NUMBER'];

//     if (!connectionString || !fromPhoneNumber) {
//         throw new Error('Azure connection string or phone number is not set.');
//     }

//     // Create an instance of the SmsClient
//     const smsClient = new SmsClient(connectionString);

//     // Send the SMS to all the mobile numbers in bulk
//     const response = await smsClient.send({
//         from: fromPhoneNumber,
//         to: mobileNumbers,
//         message: message
//     });

//     return response;
// }

// /**
//  * Main function to fetch mobile numbers based on filters and send SMS messages in bulk.
//  */
// async function main() {
//     try {
//         // Example: Fetch mobile numbers for specific filtering conditions.
//         // Change these values to test different scenarios.
//         // For example, to send to all employees, use '1' and pass nulls for filters.
//         // Here, we are applying filters (allEmployees !== '1').
//         const mobileNumbers = await getMobileNumbers('0', [1, 2], [3, 4], null, null);
//         console.log('Fetched Mobile Numbers:', mobileNumbers);

//         // Check if any mobile numbers were returned
//         if (mobileNumbers.length === 0) {
//             console.log('No mobile numbers found for the given filters.');
//             return;
//         }

//         // Define the message to be sent
//         const message = "This is a bulk announcement message from Azure Communication Services!";

//         // Send the bulk SMS
//         const smsResponse = await sendBulkSMS(mobileNumbers, message);
//         console.log('SMS Send Response:', smsResponse);
//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// }

// // Run the main function
// main();
