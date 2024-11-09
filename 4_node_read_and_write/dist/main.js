"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const WebIFC = require("web-ifc");
const bootstrap = async () => {
    const api = new WebIFC.IfcAPI();
    await api.Init();
    const modelId = api.CreateModel({
        schema: WebIFC.Schemas.IFC4,
        name: 'model name',
        description: ['model desc'],
        authors: ['deeply depressed hackers'],
        organizations: [],
    });
    const organization = new WebIFC.IFC4.IfcOrganization(new WebIFC.IFC4.IfcIdentifier('organization id'), null, new WebIFC.IFC4.IfcLabel('organization name'), null, null);
    api.WriteLine(modelId, organization);
    const application = new WebIFC.IFC4.IfcApplication(organization, new WebIFC.IFC4.IfcLabel('application version'), new WebIFC.IFC4.IfcLabel('application name'), new WebIFC.IFC4.IfcLabel('app'));
    api.WriteLine(modelId, application);
    const unit = new WebIFC.IFC4.IfcSIUnit(WebIFC.IFC4.IfcUnitEnum.VOLUMEUNIT, WebIFC.IFC4.IfcSIPrefix.MILLI, WebIFC.IFC4.IfcSIUnitName.CUBIC_METRE);
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
    const project = new WebIFC.IFC4.IfcProject(new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()), null, new WebIFC.IFC4.IfcLabel('project'), new WebIFC.IFC4.IfcText('project description'), null, null, null, [geometry], assignment);
    api.WriteLine(modelId, project);
    const profile = new WebIFC.IFC4.IfcRectangleProfileDef(WebIFC.IFC4.IfcProfileTypeEnum.AREA, new WebIFC.IFC4.IfcLabel('profile'), null, new WebIFC.IFC4.IfcPositiveLengthMeasure(300), new WebIFC.IFC4.IfcPositiveLengthMeasure(400));
    const solid = new WebIFC.IFC4.IfcExtrudedAreaSolid(profile, axis, direction, new WebIFC.IFC4.IfcPositiveLengthMeasure(4000));
    const shape = new WebIFC.IFC4.IfcShapeRepresentation(geometry, new WebIFC.IFC4.IfcLabel('solid'), new WebIFC.IFC4.IfcLabel('solid description'), [solid]);
    const product = new WebIFC.IFC4.IfcProductDefinitionShape(null, null, [shape]);
    const column = new WebIFC.IFC4.IfcColumn(new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()), null, new WebIFC.IFC4.IfcLabel('column'), new WebIFC.IFC4.IfcText('column description'), null, null, product, new WebIFC.IFC4.IfcIdentifier('column identifier'), WebIFC.IFC4.IfcColumnTypeEnum.NOTDEFINED);
    api.WriteLine(modelId, column);
    const color = new WebIFC.IFC4.IfcColourRgb(null, new WebIFC.IFC4.IfcNormalisedRatioMeasure(0.5), new WebIFC.IFC4.IfcNormalisedRatioMeasure(0.5), new WebIFC.IFC4.IfcNormalisedRatioMeasure(0.5));
    api.WriteLine(modelId, color);
    const rendering = new WebIFC.IFC4.IfcSurfaceStyleRendering(color, new WebIFC.IFC4.IfcNormalisedRatioMeasure(0), new WebIFC.IFC4.IfcNormalisedRatioMeasure(0), null, null, null, null, null, WebIFC.IFC4.IfcReflectanceMethodEnum.NOTDEFINED);
    const style = new WebIFC.IFC4.IfcSurfaceStyle(new WebIFC.IFC4.IfcLabel('my surfacestyle'), WebIFC.IFC4.IfcSurfaceSide.BOTH, [rendering]);
    api.WriteLine(modelId, style);
    const item = new WebIFC.IFC4.IfcStyledItem(solid, [style], null);
    api.WriteLine(modelId, item);
    const site = new WebIFC.IFC4.IfcSite(new WebIFC.IFC4.IfcGloballyUniqueId('site id'), null, new WebIFC.IFC4.IfcLabel('my site'), new WebIFC.IFC4.IfcText(''), null, null, null, null, null, null, null, null, null, null);
    api.WriteLine(modelId, site);
    const aggregation = new WebIFC.IFC4.IfcRelAggregates(new WebIFC.IFC4.IfcGloballyUniqueId('aggregation id'), null, null, null, project, [site]);
    api.WriteLine(modelId, aggregation);
    const building = new WebIFC.IFC4.IfcBuilding(new WebIFC.IFC4.IfcGloballyUniqueId('building id'), null, new WebIFC.IFC4.IfcLabel('building'), new WebIFC.IFC4.IfcText(''), null, null, null, null, null, null, null, null);
    api.WriteLine(modelId, building);
    aggregation.expressID = api.GetMaxExpressID(modelId) + 1;
    aggregation.GlobalId = new WebIFC.IFC4.IfcGloballyUniqueId('aggregation id.2');
    aggregation.RelatedObjects = [building];
    aggregation.RelatingObject = site;
    api.WriteLine(modelId, aggregation);
    const storey = new WebIFC.IFC4.IfcBuildingStorey(new WebIFC.IFC4.IfcGloballyUniqueId('story id.2'), null, new WebIFC.IFC4.IfcLabel('level 0'), new WebIFC.IFC4.IfcText('story'), null, null, null, null, null, new WebIFC.IFC4.IfcPositiveLengthMeasure(0));
    api.WriteLine(modelId, storey);
    aggregation.expressID = api.GetMaxExpressID(modelId) + 1;
    aggregation.GlobalId = new WebIFC.IFC4.IfcGloballyUniqueId('aggregation id.3');
    aggregation.RelatedObjects = [storey];
    aggregation.RelatingObject = building;
    api.WriteLine(modelId, aggregation);
    const elements = [column];
    const spatial = new WebIFC.IFC4.IfcRelContainedInSpatialStructure(new WebIFC.IFC4.IfcGloballyUniqueId('spatial id'), null, null, null, elements, storey);
    api.WriteLine(modelId, spatial);
    fs.writeFileSync(path.join(process.cwd(), 'etc', `model-${Date.now()}.ifc`), api.SaveModel(modelId));
    api.CloseModel(modelId);
};
bootstrap().catch(console.error);
//# sourceMappingURL=main.js.map