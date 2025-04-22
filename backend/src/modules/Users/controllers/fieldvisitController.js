// import  FieldVisitService  from "../services/fieldvisitService.js";
import {FieldVisitService} from '../services/fieldvisitService.js';

// Using an object literal for the controller
export const fieldVisitController = {
    createFieldVisit: async (req, res) => {
        try {
            const { user_id, subject, message, location, loc_coordinates } = req.body;

            // Validate required fields
            if (!user_id || !subject) {
                return res.status(400).json({
                    success: false,
                    message: 'user_id and subject are required'
                });
            }

            const fieldVisitData = {
                user_id,
                subject,
                message,
                location,
                loc_coordinates
            };

            await FieldVisitService.createFieldVisit(fieldVisitData);
            res.status(201).json({
                success: true,
                message: 'Field visit created successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

// // Using an object literal for the controller
// export const fieldVisitController = {
//     createFieldVisit: async (req, res) => {
//         try {
//             const { user_id, subject, message, location, loc_coordinates } = req.body;

//             // Validate required fields
//             if (!user_id || !subject) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'user_id and subject are required'
//                 });
//             }

//             const fieldVisitData = {
//                 user_id,
//                 subject,
//                 message,
//                 location,
//                 loc_coordinates
//             };

//             await FieldVisitService.createFieldVisit(fieldVisitData);
//             res.status(201).json({
//                 success: true,
//                 message: 'Field visit created successfully'
//             });
//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 message: error.message
//             });
//         }
//     }
// };