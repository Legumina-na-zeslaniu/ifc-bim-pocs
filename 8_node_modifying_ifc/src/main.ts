import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as WebIFC from 'web-ifc';

const bootstrap = async () => {
    const api = new WebIFC.IfcAPI();
    await api.Init();

    const modelId = api.OpenModel(fs.readFileSync(path.join(process.cwd(), 'etc', 'model.ifc')), { COORDINATE_TO_ORIGIN: true });

    const circuit = [
        { field: 'Type', value: 'Electrical Pane' },
        { field: 'Name', value: 'Circuit Breaker Box' },
        { field: 'Color', value: 'White and Blue' },
        { field: 'Condition', value: 'Good' },
        { field: 'Manufacturer', value: 'A|B' },
        { field: 'NumberOfCircuits', value: '13' },
        { field: 'RatedVoltage', value: '230v' },
        { field: 'EstimatedSize', value: '20x30x8 [cm]' },
    ];

    const cable = [
        { field: 'Type', value: 'Cables' },
        { field: 'Name', value: 'Hight Voltage Cable' },
        { field: 'Color', value: 'Yellow' },
        { field: 'Condition', value: 'Degraded' },
        { field: 'Manufacturer', value: 'ZigTic' },
        { field: 'EstimatedLength', value: '76 [m]' },
    ]

    const elements = [
        spawn(api, modelId, [0, 0, 4], [0, 0, 0], [1000, 1000, 5000], [0, 0.5, 1.0], 'CircuitBreakerBox:#1', circuit),
        spawn(api, modelId, [-10, -3.15, 4], [0, 0, 0], [1000, 1000, 5000], [0, 0.5, 1.0], 'CircuitBreakerBox:#2', circuit),
        spawn(api, modelId, [-20, -6.3, 4], [0, 0, 0], [1000, 1000, 5000], [0, 0.5, 1.0], 'CircuitBreakerBox:#3', circuit),
        spawn(api, modelId, [10, 3.15, 4], [0, 0, 0], [1000, 1000, 5000], [0, 0.5, 1.0], 'CircuitBreakerBox:#4', circuit),
        spawn(api, modelId, [20, 6.3, 4], [0, 0, 0], [1000, 1000, 5000], [0, 0.5, 1.0], 'CircuitBreakerBox:#5', circuit),
        spawn(api, modelId, [0, 0, 8], [0.0315, -0.1, 0], [125000, 300, 300], [1.0, 0.5, 0.0], 'HighVoltageCables:#1', cable),
    ];

    const spatial = new WebIFC.IFC4.IfcRelContainedInSpatialStructure(
        new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()),
        new WebIFC.Handle(20),
        null,
        null,
        elements,
        new WebIFC.Handle(102)
    );

    api.WriteLine(modelId, spatial);

    const bytes = api.SaveModel(modelId);
    const buffer = Buffer.from(bytes);
    const text = buffer.toString().replace(/IFCSIUNIT\(#0,/g, 'IFCSIUNIT(*,');

    fs.writeFileSync(path.join(process.cwd(), 'etc', `model-${Date.now()}.ifc`), Buffer.from(text));
    api.CloseModel(modelId);
}

const spawn = (
    api: WebIFC.IfcAPI,
    modelId: number,
    coords: number[],
    rotate: number[],
    size: number[],
    rgb: number[],
    name: string,
    props: { field: string, value: string }[]
) => {
    const origin = [
        new WebIFC.IFC4.IfcLengthMeasure(0),
        new WebIFC.IFC4.IfcLengthMeasure(0),
        new WebIFC.IFC4.IfcLengthMeasure(0),
    ]

    const point = new WebIFC.IFC4.IfcCartesianPoint(origin);

    api.WriteLine(modelId, point);

    origin[2].value = 1;
    const direction = new WebIFC.IFC4.IfcDirection(origin);

    const axis = new WebIFC.IFC4.IfcAxis2Placement3D(
        point,
        direction,
        null
    );

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
        new WebIFC.Handle(20),
        new WebIFC.IFC4.IfcLabel('project'),
        new WebIFC.IFC4.IfcText('project description'),
        null,
        null,
        null,
        [geometry],
        new WebIFC.Handle(84)
    );

    api.WriteLine(modelId, project);

    const position = new WebIFC.IFC4.IfcAxis2Placement2D(
        new WebIFC.IFC4.IfcCartesianPoint([
            new WebIFC.IFC4.IfcLengthMeasure(coords[0] * 1000),
            new WebIFC.IFC4.IfcLengthMeasure(coords[1] * 1000),
        ]),
        new WebIFC.IFC4.IfcDirection([
            new WebIFC.IFC4.IfcReal(0),
            new WebIFC.IFC4.IfcReal(0),
        ])
    );

    api.WriteLine(modelId, position);

    const profile = new WebIFC.IFC4.IfcRectangleProfileDef(
        WebIFC.IFC4.IfcProfileTypeEnum.AREA,
        new WebIFC.IFC4.IfcLabel('profile'),
        new WebIFC.Handle(position.expressID),
        new WebIFC.IFC4.IfcPositiveLengthMeasure(size[0]),
        new WebIFC.IFC4.IfcPositiveLengthMeasure(size[1]),
    );

    const solid = new WebIFC.IFC4.IfcExtrudedAreaSolid(
        profile,
        axis,
        direction,
        new WebIFC.IFC4.IfcPositiveLengthMeasure(size[2]),
    );

    const shape = new WebIFC.IFC4.IfcShapeRepresentation(
        geometry,
        new WebIFC.IFC4.IfcLabel('solid'),
        new WebIFC.IFC4.IfcLabel('solid description'),
        [solid]
    );

    const product = new WebIFC.IFC4.IfcProductDefinitionShape(
        null,
        null,
        [shape]
    );

    const column = new WebIFC.IFC4.IfcColumn(
        new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()),
        new WebIFC.Handle(20),
        new WebIFC.IFC4.IfcLabel(name),
        null,
        null,
        new WebIFC.IFC4.IfcLocalPlacement(
            null,
            new WebIFC.IFC4.IfcAxis2Placement3D(
                new WebIFC.IFC4.IfcCartesianPoint([
                    new WebIFC.IFC4.IfcLengthMeasure(coords[0] * 1000),
                    new WebIFC.IFC4.IfcLengthMeasure(coords[1] * 1000),
                    new WebIFC.IFC4.IfcLengthMeasure(coords[2] * 1000),
                ]),
                new WebIFC.IFC4.IfcDirection([
                    new WebIFC.IFC4.IfcReal(rotate[0]),
                    new WebIFC.IFC4.IfcReal(rotate[1]),
                    new WebIFC.IFC4.IfcReal(rotate[2]),
                ]),
                null
            ),
        ),
        product,
        new WebIFC.IFC4.IfcIdentifier(name),
        WebIFC.IFC4.IfcColumnTypeEnum.NOTDEFINED,
    );

    api.WriteLine(modelId, column);

    const propertySet = new WebIFC.IFC4.IfcPropertySet(
        new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()),
        new WebIFC.Handle(20),
        new WebIFC.IFC4.IfcLabel('Pset_AssetEase'),
        null,
        props.map(prop => new WebIFC.IFC4.IfcPropertySingleValue(
            new WebIFC.IFC4.IfcIdentifier(prop.field),
            null,
            new WebIFC.IFC4.IfcLabel(prop.value),
            null,
        ))
    );

    api.WriteLine(modelId, propertySet);

    const defines = new WebIFC.IFC4.IfcRelDefinesByProperties(
        new WebIFC.IFC4.IfcGloballyUniqueId(crypto.randomUUID()),
        new WebIFC.Handle(20),
        null,
        null,
        [column],
        propertySet,
    );

    api.WriteLine(modelId, defines);

    const color = new WebIFC.IFC4.IfcColourRgb(
        null,
        new WebIFC.IFC4.IfcNormalisedRatioMeasure(rgb[0]),
        new WebIFC.IFC4.IfcNormalisedRatioMeasure(rgb[1]),
        new WebIFC.IFC4.IfcNormalisedRatioMeasure(rgb[2]),
    );

    api.WriteLine(modelId, color);

    const rendering = new WebIFC.IFC4.IfcSurfaceStyleRendering(
        color,
        new WebIFC.IFC4.IfcNormalisedRatioMeasure(0),
        null,
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
        [new WebIFC.IFC4.IfcPresentationStyleAssignment([style])],
        null
    )

    api.WriteLine(modelId, item);

    return column;
}

bootstrap().catch(console.error);
