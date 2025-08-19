const userProductsRepo = require("../repositories/user_products_repo");
const { getUserProjects, exportProjectsAsPDF, deleteUploadedProjects } = require("../services/pacdora");

const getUsersProducts = async (req, res) => {
  // console.log(">>>>>getPacdoraProducts");
  try {
    // console.log("req.body", req.body, req.user);
    // console.log("111");
    const productList = await getUserProjects({
      userId: req.user.pacdora_user_id,
    });
    // console.log("productList", productList);
    // const resultsfse = await userProductsRepo.getActiveProductsList(productList.data.map(o => String(o.id)))
    // console.log("resultsfse", resultsfse);
    //getActiveProductsList
    

    // console.log("productList", productList.data);
    for (let data of productList.data) {
      const userProduct = await userProductsRepo.findProductByFilter({ project_id: data.id });
      data.user_products = userProduct;
    }

    return res
      .status(200)
      .json({
        status: true,
        message: "Logged out successfully.",
        data: productList,
      });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message: err.message,
      data: null,
    });
  }
};

const deleteProduct = async (req, res) => {
  console.log(">>>>>deleteProduct",req.body);
  try {
    // console.log("req.body", req.body, req.user);
    console.log("111");
    //TODO: Check if Project id is valid and is under the userid
    const productList = await deleteUploadedProjects([req.body.project_id]);
    console.log("deleteUploadedProjects", productList)
    return res
      .status(200)
      .json({
        status: true,
        message: "Logged out successfully.",
        data: productList,
      });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message: err.message,
      data: null,
    });
  }
};

const downloadDieline = async (req, res) => {
  // console.log(">>>>>getPacdoraProducts");
  try {
    console.log("req.body", req.body, req.user);
    const { project_id } = req.body;
    const productList = await exportProjectsAsPDF({
      projectIds: [project_id],
    });

    // console.log("111", productList);
    
    // const downloadKnifeREsult = await downloadKnife({
    //   projectIds: [project_id],
    //   taskId: productList.data[0].taskId
    // });

    // console.log("downloadKnifeREsult", downloadKnifeREsult);

    

    // const status = await checkPdfKnifeStatus({ projectIds: [project_id], taskId: productList.data[0].taskId });

    // console.log("downloadDieline productList", productList, status);

    return res
      .status(200)
      .json({
        status: true,
        message: "Dieline Download",
        data: productList,
      });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message: err.message,
      data: null,
    });
  }
};

module.exports = {
  // getPacdoraCategories,
  getUsersProducts,
  deleteProduct,
  downloadDieline,
};
