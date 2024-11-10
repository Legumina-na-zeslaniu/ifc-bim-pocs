"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const WebIFC = require("web-ifc");
const bootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
    const api = new WebIFC.IfcAPI();
    yield api.Init();
    const modelId = api.OpenModel(fs.readFileSync(path.join(process.cwd(), 'etc', 'model.ifc')), { COORDINATE_TO_ORIGIN: true });
    // const organization = new WebIFC.IFC4.IfcOrganization(
    //     new WebIFC.IFC4.IfcIdentifier('organization id'),
    //     new WebIFC.IFC4.IfcLabel('organization name'),
    //     null,
    //     null,
    //     null,
    // );
    // api.WriteLine(modelId, organization);
    // const application = new WebIFC.IFC4.IfcApplication(
    //     organization,
    //     new WebIFC.IFC4.IfcLabel('application version'),
    //     new WebIFC.IFC4.IfcLabel('application name'),
    //     new WebIFC.IFC4.IfcLabel('app'),
    // );
    // api.WriteLine(modelId, application);
    const unit = new WebIFC.IFC4.IfcSIUnit(WebIFC.IFC4.IfcUnitEnum.VOLUMEUNIT, null, WebIFC.IFC4.IfcSIUnitName.CUBIC_METRE);
    const assignment = new WebIFC.IFC4.IfcUnitAssignment([unit]);
    api.WriteLine(modelId, assignment);
    const origin = [
        new WebIFC.IFC4.IfcLengthMeasure(0),
        new WebIFC.IFC4.IfcLengthMeasure(0),
        new WebIFC.IFC4.IfcLengthMeasure(0),
    ];
    const point = new WebIFC.IFC4.IfcCartesianPoint(origin);
    api.WriteLine(modelId, point);
    origin[2].value = 1;
    const direction = new WebIFC.IFC4.IfcDirection(origin);
    const axis = new WebIFC.IFC4.IfcAxis2Placement3D(point, direction, null);
    api.WriteLine(modelId, axis);
    const geometry = new WebIFC.IFC4.IfcGeometricRepresentationContext(new WebIFC.IFC4.IfcLabel('model'), new WebIFC.IFC4.IfcLabel('model'), new WebIFC.IFC4.IfcDimensionCount(3), null, axis, direction);
    api.WriteLine(modelId, geometry);
    const history = new WebIFC.IFC4.IfcOwnerHistory(new WebIFC.IFC4.IfcPersonAndOrganization(new WebIFC.IFC4.IfcPerson(null, null, null, null, null, null, null, null), new WebIFC.Handle(1), null), new WebIFC.Handle(2), null, WebIFC.IFC4.IfcChangeActionEnum.ADDED, null, null, null, new WebIFC.IFC4.IfcTimeStamp('2024-11-09T21:34:00Z'));
    api.WriteLine(modelId, history);
    const project = new WebIFC.IFC4.IfcProject(new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()), new WebIFC.Handle(history.expressID), new WebIFC.IFC4.IfcLabel('project'), new WebIFC.IFC4.IfcText('project description'), null, null, null, [geometry], assignment);
    api.WriteLine(modelId, project);
    const position = new WebIFC.IFC4.IfcAxis2Placement2D(new WebIFC.IFC4.IfcCartesianPoint([
        new WebIFC.IFC4.IfcLengthMeasure(0),
        new WebIFC.IFC4.IfcLengthMeasure(0),
    ]), new WebIFC.IFC4.IfcDirection([
        new WebIFC.IFC4.IfcReal(0),
        new WebIFC.IFC4.IfcReal(0),
    ]));
    api.WriteLine(modelId, position);
    const profile = new WebIFC.IFC4.IfcRectangleProfileDef(WebIFC.IFC4.IfcProfileTypeEnum.AREA, new WebIFC.IFC4.IfcLabel('profile'), new WebIFC.Handle(position.expressID), new WebIFC.IFC4.IfcPositiveLengthMeasure(1000), new WebIFC.IFC4.IfcPositiveLengthMeasure(1000));
    const solid = new WebIFC.IFC4.IfcExtrudedAreaSolid(profile, axis, direction, new WebIFC.IFC4.IfcPositiveLengthMeasure(1000));
    const shape = new WebIFC.IFC4.IfcShapeRepresentation(geometry, new WebIFC.IFC4.IfcLabel('solid'), new WebIFC.IFC4.IfcLabel('solid description'), [solid]);
    const product = new WebIFC.IFC4.IfcProductDefinitionShape(null, null, [shape]);
    const column = new WebIFC.IFC4.IfcColumn(new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()), new WebIFC.Handle(history.expressID), new WebIFC.IFC4.IfcLabel('column'), new WebIFC.IFC4.IfcText('column description'), null, null, product, new WebIFC.IFC4.IfcIdentifier('column identifier'), WebIFC.IFC4.IfcColumnTypeEnum.NOTDEFINED);
    api.WriteLine(modelId, column);
    const manufacture = new WebIFC.IFC4.IfcPropertySingleValue(new WebIFC.IFC4.IfcIdentifier("Manufacturer"), null, new WebIFC.IFC4.IfcLabel("MSI"), null);
    const model = new WebIFC.IFC4.IfcPropertySingleValue(new WebIFC.IFC4.IfcIdentifier("Model"), null, new WebIFC.IFC4.IfcLabel("GV62 8RE-016US"), null);
    const propertySet = new WebIFC.IFC4.IfcPropertySet(new WebIFC.IFC4.IfcGloballyUniqueId('property set id'), new WebIFC.Handle(history.expressID), new WebIFC.IFC4.IfcLabel('Pset_SpaceCommon'), null, [manufacture, model]);
    api.WriteLine(modelId, propertySet);
    const defines = new WebIFC.IFC4.IfcRelDefinesByProperties(new WebIFC.IFC4.IfcGloballyUniqueId('defines id'), new WebIFC.Handle(history.expressID), null, null, [column], propertySet);
    api.WriteLine(modelId, defines);
    const color = new WebIFC.IFC4.IfcColourRgb(null, new WebIFC.IFC4.IfcNormalisedRatioMeasure(1.0), new WebIFC.IFC4.IfcNormalisedRatioMeasure(0.0), new WebIFC.IFC4.IfcNormalisedRatioMeasure(0.0));
    api.WriteLine(modelId, color);
    const rendering = new WebIFC.IFC4.IfcSurfaceStyleRendering(color, new WebIFC.IFC4.IfcNormalisedRatioMeasure(0), null, null, null, null, null, null, WebIFC.IFC4.IfcReflectanceMethodEnum.NOTDEFINED);
    const style = new WebIFC.IFC4.IfcSurfaceStyle(new WebIFC.IFC4.IfcLabel('my surfacestyle'), WebIFC.IFC4.IfcSurfaceSide.BOTH, [rendering]);
    api.WriteLine(modelId, style);
    const item = new WebIFC.IFC4.IfcStyledItem(solid, [new WebIFC.IFC4.IfcPresentationStyleAssignment([style])], null);
    api.WriteLine(modelId, item);
    const elements = [column];
    const spatial = new WebIFC.IFC4.IfcRelContainedInSpatialStructure(new WebIFC.IFC4.IfcGloballyUniqueId('spatial id'), new WebIFC.Handle(history.expressID), null, null, elements, new WebIFC.Handle(102));
    api.WriteLine(modelId, spatial);
    const bytes = api.SaveModel(modelId);
    const buffer = Buffer.from(bytes);
    const text = buffer.toString().replace(/IFCSIUNIT\(#0,/g, 'IFCSIUNIT(*,');
    fs.writeFileSync(path.join(process.cwd(), 'etc', `model-${Date.now()}.ifc`), Buffer.from(text));
    api.CloseModel(modelId);
});
bootstrap().catch(console.error);
//# sourceMappingURL=main.js.map