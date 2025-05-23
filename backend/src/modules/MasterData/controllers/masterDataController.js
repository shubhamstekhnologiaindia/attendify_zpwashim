import { masterDataService } from "../services/masterDataService.js";


export const MasterData = {
  getDepartments: async (req, res) => {
    try {
      const departments = await masterDataService.getDepartments();

      res.status(200).json({
        success: true,
        data: departments,
      });
    } catch (error) {
      console.error("Error in DepartmentController - getDepartments:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },


  // getHeadquartersAndOfficeLocations: async (req, res) => {
  //   try {
  //     const { departmentId } = req.params;

  //     if (!departmentId || isNaN(departmentId)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Invalid department ID",
  //       });
  //     }

  //     // Fetch all headquarters
  //     const headquarters = await masterDataService.getHeadquarters();

  //     // Fetch office locations by department ID
  //     const officeLocations = await masterDataService.getOfficeLocationsByDepartmentId();

  //      // Fetch all sansthas
  //   const sansthas = await masterDataService.getAllSansthas();

  //     res.status(200).json({
  //       success: true,
  //       data: {
  //         headquarters: headquarters.length > 0 ? headquarters : [],
  //         officeLocations: officeLocations.length > 0 ? officeLocations : [],
  //         sansthas: sansthas.length > 0 ? sansthas : [],
  //       },
  //     });
  //   } catch (error) {
  //     console.error(
  //       "Error in MasterDropdown - getHeadquartersAndOfficeLocations:",
  //       error
  //     );
  //     res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //     });
  //   }
  // },
 

  getHeadquartersZpSanstha: async (req, res) => {
    try {
      const { departmentId } = req.params;
      const dropdownData = await masterDataService.getOfficeLocationDropdown(departmentId);
  
      res.status(200).json({
        success: true,
        data: dropdownData
      });
    } catch (error) {
      console.error("Error in MasterDropdown - getOfficeLocations:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
  

  getCadresByOfficeLocationId: async (req, res) => {
    try {
      const { officeLocationId, dept_id } = req.query;
  
      if (!officeLocationId || isNaN(officeLocationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid office location ID",
        });
      }
  
      const cadres = await masterDataService.getCadresByOfficeLocationId(officeLocationId, dept_id);
  
      res.status(200).json({
        success: true,
        data: cadres,
      });
    } catch (error) {
      console.error("Error in OfficeCadreController - getCadresByOfficeLocationId:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },   

  getTalukas: async (req, res) => {
    try {
      const talukas = await masterDataService.getTalukas();
      res.status(200).json({ success: true, data: talukas });
    } catch (error) {
      console.error("Error in TalukaController - getTalukas:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },


  getVillagesByTalukaId: async (req, res) => {
    try {
      const { talukaId } = req.params;

      if (!talukaId) {
        return res
          .status(400)
          .json({ success: false, message: "Taluka ID is required" });
      }

      const villages = await masterDataService.getVillagesByTalukaId(
        talukaId
      );
      res.status(200).json({ success: true, data: villages });
    } catch (error) {
      console.error(
        "Error in VillageController - getVillagesByTalukaId:",
        error
      );
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },


getCadresByDeptId: async (req, res) => {
    try {
        const { deptId } = req.params;

        if (!deptId) {
            return res.status(400).json({ status: false, message: "deptId is required" });
        }
        const result = await masterDataService.getCadresByDeptId(deptId);
        return res.status(200).json(result);
    } catch (error) {
      console.log(error)
        return res.status(400).json({ status: false, message: error.message });
    }
},

GetPanchayatSamitiLocations: async (req, res) => {
  try {
    const result = await masterDataService.GetPanchayatSamitiLocations();
console.log
    console.log("API Result:", result);

    return res.status(200).json({
      status: true,
      data: result.data, 
      message: "Panchayat Samiti locations retrieved successfully",
    });
  } catch (error) {
    console.error("Error:", error); 
    return res.status(400).json({
      status: false,
      message: error.message || "Something went wrong",
    });
  }
},

GetSansthaLocations: async (req, res) => {
  try {
    const deptId = req.query.deptId; 

    if (!deptId) {
      return res.status(400).json({
        status: false,
        message: "Missing deptId",
      });
    }

    const result = await masterDataService.GetSansthaLocations(deptId);

    return res.status(200).json({
      status: true,
      data: result.data,
      message: "Sanstha locations retrieved successfully",
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(400).json({
      status: false,
      message: error.message || "Something went wrong",
    });
  }
},



getUsersForSalaryRequest: async (req, res) => {
  try {
    let { dept_ids } = req.query;

    // Handle JSON string input like "[1,2]"
    if (typeof dept_ids === 'string') {
      try {
        dept_ids = JSON.parse(dept_ids);
      } catch (e) {
        return res.status(400).json({
          status: false,
          message: "Invalid dept_ids format. Use JSON array format like [1,2]",
        });
      }
    }
    const response = await masterDataService.getUsersForSalaryRequest(dept_ids);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Server error",
    });
  }
},
}
