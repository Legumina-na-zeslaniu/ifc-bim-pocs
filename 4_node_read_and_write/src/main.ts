import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as WebIFC from 'web-ifc';

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

    const organization = new WebIFC.IFC4.IfcOrganization(
        new WebIFC.IFC4.IfcIdentifier('organization id'),
        null,
        new WebIFC.IFC4.IfcLabel('organization name'),
        null,
        null,
    );

    api.WriteLine(modelId, organization);

    const application = new WebIFC.IFC4.IfcApplication(
        organization,
        new WebIFC.IFC4.IfcLabel('application version'),
        new WebIFC.IFC4.IfcLabel('application name'),
        new WebIFC.IFC4.IfcLabel('app'),
    );

    api.WriteLine(modelId, application);

    const unit = new WebIFC.IFC4.IfcSIUnit(
        WebIFC.IFC4.IfcUnitEnum.VOLUMEUNIT,
        WebIFC.IFC4.IfcSIPrefix.MILLI,
        WebIFC.IFC4.IfcSIUnitName.CUBIC_METRE,
    );

    const assignment = new WebIFC.IFC4.IfcUnitAssignment([unit]);

    api.WriteLine(modelId, assignment);

    const origin = [
        new WebIFC.IFC4.IfcLengthMeasure(0),
        new WebIFC.IFC4.IfcLengthMeasure(0),
        new WebIFC.IFC4.IfcLengthMeasure(0),
    ]

    const point = new WebIFC.IFC4.IfcCartesianPoint(origin);

    api.WriteLine(modelId, point);

    origin[2].value = 1;
    const direction = new WebIFC.IFC4.IfcDirection(origin);

    const axis = new WebIFC.IFC4.IfcAxis2Placement3D(point, direction, null);
    api.WriteLine(modelId, axis);

    const geometry = new WebIFC.IFC4.IfcGeometricRepresentationContext(
        new WebIFC.IFC4.IfcLabel('model'),
        new WebIFC.IFC4.IfcLabel('model'),
        new WebIFC.IFC4.IfcDimensionCount(3),
        null,
        axis,
        direction,
    );

    api.WriteLine(modelId, geometry);

    const project = new WebIFC.IFC4.IfcProject(
        new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()),
        null,
        new WebIFC.IFC4.IfcLabel('project'),
        new WebIFC.IFC4.IfcText('project description'),
        null,
        null,
        null,
        [geometry],
        assignment,
    );

    api.WriteLine(modelId, project);

    const profile = new WebIFC.IFC4.IfcRectangleProfileDef(
        WebIFC.IFC4.IfcProfileTypeEnum.AREA,
        new WebIFC.IFC4.IfcLabel('profile'),
        null,
        new WebIFC.IFC4.IfcPositiveLengthMeasure(300),
        new WebIFC.IFC4.IfcPositiveLengthMeasure(400),
    );

    const solid = new WebIFC.IFC4.IfcExtrudedAreaSolid(
        profile,
        axis,
        direction,
        new WebIFC.IFC4.IfcPositiveLengthMeasure(4000),
    );

    const shape = new WebIFC.IFC4.IfcShapeRepresentation(
        geometry,
        new WebIFC.IFC4.IfcLabel('solid'),
        new WebIFC.IFC4.IfcLabel('solid description'),
        [solid]
    );

    const product = new WebIFC.IFC4.IfcProductDefinitionShape(null, null, [shape]);

    const column = new WebIFC.IFC4.IfcColumn(
        new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()),
        null,
        new WebIFC.IFC4.IfcLabel('column'),
        new WebIFC.IFC4.IfcText('column description'),
        null,
        null,
        product,
        new WebIFC.IFC4.IfcIdentifier('column identifier'),
        WebIFC.IFC4.IfcColumnTypeEnum.NOTDEFINED,
    );

    api.WriteLine(modelId, column);

    const color = new WebIFC.IFC4.IfcColourRgb(
        null,
        new WebIFC.IFC4.IfcNormalisedRatioMeasure(0.5),
        new WebIFC.IFC4.IfcNormalisedRatioMeasure(0.5),
        new WebIFC.IFC4.IfcNormalisedRatioMeasure(0.5),
    );

    api.WriteLine(modelId, color);

    const rendering = new WebIFC.IFC4.IfcSurfaceStyleRendering(
        color,
        new WebIFC.IFC4.IfcNormalisedRatioMeasure(0),
        new WebIFC.IFC4.IfcNormalisedRatioMeasure(0),
        null,
        null,
        null,
        null,
        null,
        WebIFC.IFC4.IfcReflectanceMethodEnum.NOTDEFINED
    );

    const style = new WebIFC.IFC4.IfcSurfaceStyle(
        new WebIFC.IFC4.IfcLabel('my surfacestyle'),
        WebIFC.IFC4.IfcSurfaceSide.BOTH,
        [rendering]
    )

    api.WriteLine(modelId, style);

    const item = new WebIFC.IFC4.IfcStyledItem(
        solid,
        [style],
        null
    )

    api.WriteLine(modelId, item);

    const site = new WebIFC.IFC4.IfcSite(
        new WebIFC.IFC4.IfcGloballyUniqueId('site id'),
        null,
        new WebIFC.IFC4.IfcLabel('my site'),
        new WebIFC.IFC4.IfcText(''),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
    );

    api.WriteLine(modelId, site);

    const aggregation = new WebIFC.IFC4.IfcRelAggregates(
        new WebIFC.IFC4.IfcGloballyUniqueId('aggregation id'),
        null,
        null,
        null,
        project,
        [site]
    );

    api.WriteLine(modelId, aggregation);

    const building = new WebIFC.IFC4.IfcBuilding(
        new WebIFC.IFC4.IfcGloballyUniqueId('building id'),
        null,
        new WebIFC.IFC4.IfcLabel('building'),
        new WebIFC.IFC4.IfcText(''),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
    );

    api.WriteLine(modelId, building);

    aggregation.expressID = api.GetMaxExpressID(modelId) + 1;
    aggregation.GlobalId = new WebIFC.IFC4.IfcGloballyUniqueId('aggregation id.2')
    aggregation.RelatedObjects = [building];
    aggregation.RelatingObject = site;

    api.WriteLine(modelId, aggregation);

    const storey = new WebIFC.IFC4.IfcBuildingStorey(
        new WebIFC.IFC4.IfcGloballyUniqueId('story id.2'),
        null,
        new WebIFC.IFC4.IfcLabel('level 0'),
        new WebIFC.IFC4.IfcText('story'),
        null,
        null,
        null,
        null,
        null,
        new WebIFC.IFC4.IfcPositiveLengthMeasure(0)
    );

    api.WriteLine(modelId, storey);

    aggregation.expressID = api.GetMaxExpressID(modelId) + 1;
    aggregation.GlobalId = new WebIFC.IFC4.IfcGloballyUniqueId('aggregation id.3');
    aggregation.RelatedObjects = [storey];
    aggregation.RelatingObject = building;

    api.WriteLine(modelId, aggregation);

    const elements = [column];

    const spatial = new WebIFC.IFC4.IfcRelContainedInSpatialStructure(
        new WebIFC.IFC4.IfcGloballyUniqueId('spatial id'),
        null,
        null,
        null,
        elements,
        storey
    );

    api.WriteLine(modelId, spatial);

    fs.writeFileSync(path.join(process.cwd(), 'etc', `model-${Date.now()}.ifc`), api.SaveModel(modelId));

    api.CloseModel(modelId);
}

bootstrap().catch(console.error);

// const modelId = api.CreateModel({ schema: WebIFC.Schemas.IFC4 });

// let dir = { x: 0, y: 0, z: 1 };
// let rad = 0.25;
// let len = 2000;

// let direction = api.CreateIfcEntity(
//     modelId,
//     WebIFC.IFCDIRECTION,
//     [
//         api.CreateIfcType(modelId, WebIFC.IFCREAL, dir.x),
//         api.CreateIfcType(modelId, WebIFC.IFCREAL, dir.y),
//         api.CreateIfcType(modelId, WebIFC.IFCREAL, dir.z)
//     ]
// );

// let locationOfProfile = api.CreateIfcEntity(
//     modelId,
//     WebIFC.IFCCARTESIANPOINT,
//     [
//         api.CreateIfcType(modelId, WebIFC.IFCLENGTHMEASURE, 0),
//         api.CreateIfcType(modelId, WebIFC.IFCLENGTHMEASURE, 0)
//     ]
// );

// let axisOfProfile = api.CreateIfcEntity(
//     modelId,
//     WebIFC.IFCAXIS2PLACEMENT2D,
//     locationOfProfile,
//     null
// );

// let profile = api.CreateIfcEntity(
//     modelId,
//     WebIFC.IFCCIRCLEPROFILEDEF,
//     WebIFC.IFC4.IfcProfileTypeEnum.AREA,
//     api.CreateIfcType(modelId, WebIFC.IFCLABEL, 'column-prefab'),
//     axisOfProfile,
//     api.CreateIfcType(modelId, WebIFC.IFCPOSITIVELENGTHMEASURE, rad)
// );

// let location = api.CreateIfcEntity(
//     modelId,
//     WebIFC.IFCCARTESIANPOINT,
//     [
//         api.CreateIfcType(modelId, WebIFC.IFCLENGTHMEASURE, 0),
//         api.CreateIfcType(modelId, WebIFC.IFCLENGTHMEASURE, 0),
//         api.CreateIfcType(modelId, WebIFC.IFCLENGTHMEASURE, 0)
//     ]
// );

// let placement = api.CreateIfcEntity(
//     modelId,
//     WebIFC.IFCAXIS2PLACEMENT3D,
//     location,
//     null,
//     null
// );

// let solid = api.CreateIfcEntity(
//     modelId,
//     WebIFC.IFCEXTRUDEDAREASOLID,
//     profile,
//     placement,
//     direction,
//     api.CreateIfcType(modelId, WebIFC.IFCPOSITIVELENGTHMEASURE, len)
// );

// let column = api.CreateIfcEntity(
//     modelId,
//     WebIFC.IFCCOLUMN,
//     api.CreateIfcType(modelId, WebIFC.IFCGLOBALLYUNIQUEID, "GUID"),
//     null,
//     api.CreateIfcType(modelId, WebIFC.IFCLABEL, "name"),
//     null,
//     api.CreateIfcType(modelId, WebIFC.IFCLABEL, "label"),
//     placement,
//     solid,
//     api.CreateIfcType(modelId, WebIFC.IFCIDENTIFIER, "sadf"),
//     null
// );

// api.WriteLine(modelId, column);


// const modelId = api.OpenModel(fs.readFileSync(path.join(process.cwd(), 'etc', 'model.ifc')));

// #11=IFCDIRECTION((1.,0.));
// #85=IFCAXIS2PLACEMENT3D(#3_,$,$);
// #86=IFCDIRECTION((6.1230317691118863E-17,1.));
// #87=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,0.01,#85_,#86_);
// #89=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#87_,$,.MODEL_VIEW.,$);
// #2418=IFCCARTESIANPOINT((1.5987211554602254E-14,0.));
// #2419=IFCAXIS2PLACEMENT2D(#2418,#11);
// #2420=IFCRECTANGLEPROFILEDEF(.AREA.,'1740X2032X2',#2419,50.799999999999997,734.99999999999875);
// #2421=IFCCARTESIANPOINT((367.50000000000159,434.59999999999889,0.));
// #2422=IFCAXIS2PLACEMENT3D(#2421,#9,#8);
// #2423=IFCEXTRUDEDAREASOLID(#2420,#2422,#9,2032.0000000000002);
// #2412=IFCCARTESIANPOINT((-1.7763568394002505E-14,0.));
// #2413=IFCAXIS2PLACEMENT2D(#2412,#11);
// #2414=IFCRECTANGLEPROFILEDEF(.AREA.,'1740X2032X2',#2413,50.799999999995052,735.00000000000045);
// #2415=IFCCARTESIANPOINT((1102.5000000000007,434.59999999999513,0.));
// #2416=IFCAXIS2PLACEMENT3D(#2415,#9,#8);
// #2417=IFCEXTRUDEDAREASOLID(#2414,#2416,#9,2031.9999999999995);
// #2399=IFCCARTESIANPOINT((-996.94999999999982,735.));
// #2400=IFCCARTESIANPOINT((1035.0499999999997,735.));
// #2401=IFCCARTESIANPOINT((1035.0499999999997,811.19999999999993));
// #2402=IFCCARTESIANPOINT((-1073.1499999999999,811.19999999999993));
// #2403=IFCCARTESIANPOINT((-1073.1499999999999,-811.19999999999993));
// #2404=IFCCARTESIANPOINT((1035.0499999999997,-811.19999999999993));
// #2405=IFCCARTESIANPOINT((1035.0499999999997,-735.));
// #2406=IFCCARTESIANPOINT((-996.94999999999982,-735.));
// #2407=IFCPOLYLINE((#2399,#2400,#2401,#2402,#2403,#2404,#2405,#2406,#2399));
// #2408=IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,'1740X2032X2',#2407);
// #2409=IFCCARTESIANPOINT((735.,460.,1035.0499999999997));
// #2410=IFCAXIS2PLACEMENT3D(#2409,#7,#10);
// #2411=IFCEXTRUDEDAREASOLID(#2408,#2410,#9,25.400000000000013);
// #2386=IFCCARTESIANPOINT((-996.94999999999982,735.));
// #2387=IFCCARTESIANPOINT((1035.0499999999997,735.));
// #2388=IFCCARTESIANPOINT((1035.0499999999997,811.19999999999993));
// #2389=IFCCARTESIANPOINT((-1073.1499999999999,811.19999999999993));
// #2390=IFCCARTESIANPOINT((-1073.1499999999999,-811.19999999999993));
// #2391=IFCCARTESIANPOINT((1035.0499999999997,-811.19999999999993));
// #2392=IFCCARTESIANPOINT((1035.0499999999997,-735.));
// #2393=IFCCARTESIANPOINT((-996.94999999999982,-735.));
// #2394=IFCPOLYLINE((#2386,#2387,#2388,#2389,#2390,#2391,#2392,#2393,#2386));
// #2395=IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,'1740X2032X2',#2394);
// #2396=IFCCARTESIANPOINT((735.,-25.400000000002382,1035.0499999999997));
// #2397=IFCAXIS2PLACEMENT3D(#2396,#7,#10);
// #2398=IFCEXTRUDEDAREASOLID(#2395,#2397,#9,25.400000000000013);
// #2436=IFCSHAPEREPRESENTATION(#89_,'Body','SweptSolid',(#2398,#2411,#2417,#2423));
// #2437=IFCAXIS2PLACEMENT3D(#3_,$,$);
// #2438=IFCREPRESENTATIONMAP(#2437,_#2436)_;
// #2455=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#3_,1.,$);
// #2456=IFCMAPPEDITEM(#2438_,#2455_);
// #2457=IFCSHAPEREPRESENTATION(#89_,'Body','MappedRepresentation',(#2456_));
// #2458=IFCPRODUCTDEFINITIONSHAPE($,$,(#2457_));

// #3=IFCCARTESIANPOINT((0.,0.,0.));
// #15=IFCAXIS2PLACEMENT3D(#3_,$,$);
// #16=IFCLOCALPLACEMENT(#172,#15_);
// #99=IFCCARTESIANPOINT((0.,0.,4105.));
// #100=IFCAXIS2PLACEMENT3D(#99_,$,$);
// #101=IFCLOCALPLACEMENT(#16_,#100_);
// #171=IFCAXIS2PLACEMENT3D(#3_,$,$);
// #172=IFCLOCALPLACEMENT($,#171_);
// #2352=IFCCARTESIANPOINT((-70500.741410041039,-59912.193294825753,0.));
// #2353=IFCDIRECTION((-0.95464844998781528,-0.29773534713880029,0.));
// #2354=IFCAXIS2PLACEMENT3D(#2352,#9,#2353);
// #5567=IFCCARTESIANPOINT((1414.0021732515625,-230.,0.));
// #5568=IFCAXIS2PLACEMENT3D(#5567_,$,$);
// #2355=IFCLOCALPLACEMENT(#101_,#2354_);
// #5573=IFCAXIS2PLACEMENT3D(#3_,$,$)
// #5569=IFCLOCALPLACEMENT(#2355_,#5568_);
// #5574=IFCLOCALPLACEMENT(#5569_,#5573_);

// IFCDOOR(
//     GlobalId: '0Qn3FOqo93VwfcOrwxUUbF',
//     OwnerHistory: #20,
//     Name: 'Door-Double-Flush_Panel:1740X2032X2:379355',
//     Description: $,
//     ObjectType: 'Door-Double-Flush_Panel:1740X2032X2',
//     ObjectPlacement: #5574,
//     Representation: #2458,
//     Tag: '379355',
//     OverallHeight: 2031.9999999999993,
//     OverallWidth: 1470.0000000000043
// );

// constructor(
//     GlobalId: IfcGloballyUniqueId,
//     OwnerHistory: (Handle<IfcOwnerHistory> | IfcOwnerHistory) | null,
//     Name: IfcLabel | null,
//     Description: IfcText | null,
//     ObjectType: IfcLabel | null,
//     ObjectPlacement: (Handle<IfcObjectPlacement> | IfcObjectPlacement) | null,
//     Representation: (Handle<IfcProductRepresentation> | IfcProductRepresentation) | null,
//     Tag: IfcIdentifier | null,
//     OverallHeight: IfcPositiveLengthMeasure | null,
//     OverallWidth: IfcPositiveLengthMeasure | null,
//     PredefinedType: IfcDoorTypeEnum | null,
//     OperationType: IfcDoorTypeOperationEnum | null,
//     UserDefinedOperationType: IfcLabel | null
// );

// const history = api.GetLine(modelId, 20);

// const door = new WebIFC.IFC4.IfcDoor(
//     new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()),
//     history,
//     new WebIFC.IFC4.IfcText('Door text'),
//     new WebIFC.IFC4.IfcLabel('Door label'),
//     null,
//     null,
//     null,
//     new WebIFC.IFC4.IfcIdentifier('Door identifier'),
//     new WebIFC.IFC4.IfcPositiveLengthMeasure(2000),
//     new WebIFC.IFC4.IfcPositiveLengthMeasure(2000),
//     null,
//     null,
//     new WebIFC.IFC4.IfcLabel('Door user label'),
// );


