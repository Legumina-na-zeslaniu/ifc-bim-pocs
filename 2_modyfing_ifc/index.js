const WebIFC = require("web-ifc");
const fs = require("fs");

const bootstrap = async () => {
    const ifcApi = new WebIFC.IfcAPI();

    await ifcApi.Init();

    const ifcData = fs.readFileSync("model.ifc");

    let modelID = ifcApi.OpenModel(ifcData);

    console.log("Model ID: ", modelID);

    ifcApi.CloseModel(modelID);
};

bootstrap().catch(console.error);