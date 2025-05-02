
//import MsgService from "../services/MsgService";

import  {HeadquarterService } from "../services/hqService.js";

export const HeadQuarterController = {

    // FetchHOD: async (req, res) => {
    //     try {
    //         console.log("dhfihdi")
    //         const hodDetails = await HeadquarterService.FetchHOD();

    //         if (!hodDetails.length) {
    //             return res.status(404).json({ status: false, message: "No HODs found" });
    //         }

    //         return res.status(200).json({ status: true, data: hodDetails });

    //     } catch (error) {
    //         console.error("Error fetching HOD details:", error);
    //         return res.status(500).json({ status: false, message: "Internal server error" });
    //     }
    // },

    FetchHOD: async (req, res) => {
        try {
          const users = await HeadquarterService.FetchHOD();
    
          return res.status(200).json({
            status: true,
            message: "Users with role 102 retrieved successfully",
            data: users,
          });
        } catch (error) {
          console.error("Error in listRole102Users controller:", error);
          return res.status(500).json({
            status: false,
            message: "Failed to retrieve users",
          });
        }
      },
    
    }